<?php
/**
 * Plugin Name: Size Manager
 * Plugin URI: https://www.sqb-tunisie.com
 * Description: Manage products sold by size and quantity with dynamic tables for WooCommerce
 * Version: 1.1.0
 * Author: SQB Tunisie
 * Author URI: https://www.sqb-tunisie.com
 * Text Domain: size-manager
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * WC requires at least: 5.0
 * WC tested up to: 8.0
 *
 * @package SizeManager
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('SIZE_MANAGER_VERSION', '1.1.0');
define('SIZE_MANAGER_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SIZE_MANAGER_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Main Size Manager Class
 */
class Size_Manager {
    
    /**
     * Single instance of the class
     */
    private static $instance = null;
    
    /**
     * Get single instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        // Check if WooCommerce is active
        if (!$this->is_woocommerce_active()) {
            add_action('admin_notices', array($this, 'woocommerce_missing_notice'));
            return;
        }
        
        // Initialize plugin
        $this->init_hooks();
    }
    
    /**
     * Check if WooCommerce is active
     */
    private function is_woocommerce_active() {
        return class_exists('WooCommerce');
    }
    
    /**
     * Display admin notice if WooCommerce is not active
     */
    public function woocommerce_missing_notice() {
        ?>
        <div class="error">
            <p><?php _e('Size Manager requires WooCommerce to be installed and active.', 'size-manager'); ?></p>
        </div>
        <?php
    }
    
    /**
     * Initialize hooks
     */
    private function init_hooks() {
        // Declare WooCommerce compatibility
        add_action('before_woocommerce_init', array($this, 'declare_woocommerce_compatibility'));
        
        // Admin hooks
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_filter('woocommerce_product_data_tabs', array($this, 'add_size_table_tab'));
        add_action('woocommerce_product_data_panels', array($this, 'add_size_table_panel'));
        add_action('woocommerce_process_product_meta', array($this, 'save_size_table_data'));
        
        // REST API hooks
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        
        // Frontend hooks - multiple positions to ensure display
        add_action('woocommerce_before_add_to_cart_button', array($this, 'display_size_table_frontend'), 5);
        add_action('woocommerce_single_product_summary', array($this, 'display_size_table_frontend'), 25);
        add_action('woocommerce_after_single_product_summary', array($this, 'display_size_table_frontend'), 5);
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'));
        
        // Add product meta to REST API
        add_action('rest_api_init', array($this, 'add_size_table_to_product_api'));
    }
    
    /**
     * Declare compatibility with WooCommerce features
     */
    public function declare_woocommerce_compatibility() {
        if (class_exists('\Automattic\WooCommerce\Utilities\FeaturesUtil')) {
            \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility(
                'custom_order_tables',
                __FILE__,
                true
            );
            
            \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility(
                'cart_checkout_blocks',
                __FILE__,
                true
            );
        }
    }
    
    /**
     * Enqueue admin scripts and styles
     */
    public function enqueue_admin_scripts($hook) {
        // Only load on product edit pages
        if ('post.php' !== $hook && 'post-new.php' !== $hook) {
            return;
        }
        
        global $post;
        if (!$post || 'product' !== $post->post_type) {
            return;
        }
        
        wp_enqueue_style(
            'size-manager-admin',
            SIZE_MANAGER_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            SIZE_MANAGER_VERSION
        );
        
        wp_enqueue_script(
            'size-manager-admin',
            SIZE_MANAGER_PLUGIN_URL . 'assets/js/admin.js',
            array('jquery'),
            SIZE_MANAGER_VERSION,
            true
        );
        
        wp_localize_script('size-manager-admin', 'sizeManagerData', array(
            'nonce' => wp_create_nonce('size_manager_nonce'),
            'strings' => array(
                'confirmDelete' => __('Are you sure you want to delete this row?', 'size-manager'),
                'size' => __('Size', 'size-manager'),
                'quantity' => __('Quantity', 'size-manager'),
                'price' => __('Price', 'size-manager'),
                'actions' => __('Actions', 'size-manager'),
            )
        ));
    }
    
    /**
     * Add Size Table tab to product data tabs
     */
    public function add_size_table_tab($tabs) {
        $tabs['size_table'] = array(
            'label'    => __('Size Table', 'size-manager'),
            'target'   => 'size_table_product_data',
            'class'    => array('show_if_simple', 'show_if_variable'),
            'priority' => 65,
        );
        return $tabs;
    }
    
    /**
     * Add Size Table panel content
     */
    public function add_size_table_panel() {
        global $post;
        
        $is_size_product = get_post_meta($post->ID, '_is_size_product', true);
        $size_table_data = get_post_meta($post->ID, '_size_table_data', true);
        
        if (!is_array($size_table_data)) {
            $size_table_data = array();
        }
        
        ?>
        <div id="size_table_product_data" class="panel woocommerce_options_panel">
            <div class="options_group">
                
                <?php
                woocommerce_wp_checkbox(array(
                    'id'          => '_is_size_product',
                    'label'       => __('Size & Quantity Product', 'size-manager'),
                    'description' => __('Check this if the product is sold by size and quantity (e.g., screws, bolts)', 'size-manager'),
                    'value'       => $is_size_product === 'yes' ? 'yes' : 'no',
                ));
                ?>
                
            </div>
            
            <div id="size_table_container" style="<?php echo ($is_size_product === 'yes') ? '' : 'display:none;'; ?>">
                <div class="options_group">
                    <?php
                    $unit_type = get_post_meta($post->ID, '_size_unit_type', true);
                    if (empty($unit_type)) {
                        $unit_type = 'piece';
                    }
                    
                    woocommerce_wp_select(array(
                        'id'          => '_size_unit_type',
                        'label'       => __('Unit Type', 'size-manager'),
                        'description' => __('Select how this product is sold', 'size-manager'),
                        'value'       => $unit_type,
                        'options'     => array(
                            'piece' => __('Per Piece', 'size-manager'),
                            'kg'    => __('Per Kilogram (KG)', 'size-manager'),
                            'meter' => __('Per Meter', 'size-manager'),
                            'liter' => __('Per Liter', 'size-manager'),
                        ),
                    ));
                    ?>
                </div>
                
                <div class="options_group">
                    <p class="form-field">
                        <label><?php _e('Size & Quantity Table', 'size-manager'); ?></label>
                        <button type="button" class="button button-primary" id="add_size_row">
                            <?php _e('Add Row', 'size-manager'); ?>
                        </button>
                    </p>
                    
                    <div class="size-table-wrapper">
                        <table class="widefat size-table" id="size_table">
                            <thead>
                                <tr>
                                    <th><?php _e('Size', 'size-manager'); ?></th>
                                    <th><?php _e('Available Quantity', 'size-manager'); ?></th>
                                    <th><?php _e('Price', 'size-manager'); ?> (<?php echo get_woocommerce_currency_symbol(); ?>)</th>
                                    <th><?php _e('Actions', 'size-manager'); ?></th>
                                </tr>
                            </thead>
                            <tbody id="size_table_body">
                                <?php
                                if (!empty($size_table_data)) {
                                    foreach ($size_table_data as $index => $row) {
                                        $this->render_size_row($index, $row);
                                    }
                                }
                                ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Template for new rows -->
        <script type="text/template" id="size_row_template">
            <?php $this->render_size_row('{{INDEX}}', array('size' => '', 'quantity' => '', 'price' => '')); ?>
        </script>
        <?php
    }
    
    /**
     * Render a single size table row
     */
    private function render_size_row($index, $data) {
        $size = isset($data['size']) ? esc_attr($data['size']) : '';
        $quantity = isset($data['quantity']) ? esc_attr($data['quantity']) : '';
        $price = isset($data['price']) ? esc_attr($data['price']) : '';
        ?>
        <tr class="size-row" data-index="<?php echo $index; ?>">
            <td>
                <input type="text" 
                       name="size_table[<?php echo $index; ?>][size]" 
                       value="<?php echo $size; ?>" 
                       placeholder="<?php _e('e.g., M8, 10mm, Small', 'size-manager'); ?>"
                       class="regular-text" />
            </td>
            <td>
                <input type="number" 
                       name="size_table[<?php echo $index; ?>][quantity]" 
                       value="<?php echo $quantity; ?>" 
                       placeholder="0"
                       min="0"
                       step="1"
                       class="small-text" />
            </td>
            <td>
                <input type="number" 
                       name="size_table[<?php echo $index; ?>][price]" 
                       value="<?php echo $price; ?>" 
                       placeholder="0.00"
                       min="0"
                       step="0.01"
                       class="small-text" />
            </td>
            <td>
                <button type="button" class="button remove-size-row">
                    <?php _e('Remove', 'size-manager'); ?>
                </button>
            </td>
        </tr>
        <?php
    }
    
    /**
     * Save size table data
     */
    public function save_size_table_data($post_id) {
        // Check if it's a size product
        $is_size_product = isset($_POST['_is_size_product']) ? 'yes' : 'no';
        update_post_meta($post_id, '_is_size_product', $is_size_product);
        
        // Save unit type
        if (isset($_POST['_size_unit_type'])) {
            update_post_meta($post_id, '_size_unit_type', sanitize_text_field($_POST['_size_unit_type']));
        }
        
        // Save size table data
        if (isset($_POST['size_table']) && is_array($_POST['size_table'])) {
            $size_table_data = array();
            
            foreach ($_POST['size_table'] as $row) {
                // Only save rows with at least a size
                if (!empty($row['size'])) {
                    $size_table_data[] = array(
                        'size'     => sanitize_text_field($row['size']),
                        'quantity' => absint($row['quantity']),
                        'price'    => floatval($row['price']),
                    );
                }
            }
            
            update_post_meta($post_id, '_size_table_data', $size_table_data);
        } else {
            delete_post_meta($post_id, '_size_table_data');
        }
    }
    
    /**
     * Register REST API routes
     */
    public function register_rest_routes() {
        register_rest_route('siesta/v1', '/size-table/(?P<product_id>\d+)', array(
            'methods'             => 'GET',
            'callback'            => array($this, 'get_size_table_api'),
            'permission_callback' => '__return_true',
            'args'                => array(
                'product_id' => array(
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                ),
            ),
        ));
    }
    
    /**
     * REST API callback to get size table data
     */
    public function get_size_table_api($request) {
        $product_id = $request->get_param('product_id');
        
        // Check if product exists
        $product = wc_get_product($product_id);
        if (!$product) {
            return new WP_Error(
                'product_not_found',
                __('Product not found', 'size-manager'),
                array('status' => 404)
            );
        }
        
        // Check if it's a size product
        $is_size_product = get_post_meta($product_id, '_is_size_product', true);
        if ($is_size_product !== 'yes') {
            return new WP_Error(
                'not_size_product',
                __('This product is not configured as a size product', 'size-manager'),
                array('status' => 400)
            );
        }
        
        // Get size table data
        $size_table_data = get_post_meta($product_id, '_size_table_data', true);
        
        if (!is_array($size_table_data)) {
            $size_table_data = array();
        }
        
        // Get unit type
        $unit_type = get_post_meta($product_id, '_size_unit_type', true);
        if (empty($unit_type)) {
            $unit_type = 'piece';
        }
        
        // Format response
        $response = array(
            'product_id'   => $product_id,
            'product_name' => $product->get_name(),
            'product_sku'  => $product->get_sku(),
            'is_size_product' => true,
            'unit_type'    => $unit_type,
            'size_table'   => $size_table_data,
            'currency'     => get_woocommerce_currency(),
            'currency_symbol' => get_woocommerce_currency_symbol(),
        );
        
        return rest_ensure_response($response);
    }
    
    /**
     * Add size table data to WooCommerce product REST API
     */
    public function add_size_table_to_product_api() {
        register_rest_field('product', 'size_table_data', array(
            'get_callback' => array($this, 'get_product_size_table_field'),
            'schema'       => array(
                'description' => __('Size table data for the product', 'size-manager'),
                'type'        => 'object',
            ),
        ));
    }
    
    /**
     * Get size table data for product REST API field
     */
    public function get_product_size_table_field($object) {
        $product_id = $object['id'];
        $is_size_product = get_post_meta($product_id, '_is_size_product', true);
        
        if ($is_size_product !== 'yes') {
            return null;
        }
        
        $size_table_data = get_post_meta($product_id, '_size_table_data', true);
        $unit_type = get_post_meta($product_id, '_size_unit_type', true);
        
        if (empty($unit_type)) {
            $unit_type = 'piece';
        }
        
        return array(
            'is_size_product' => true,
            'unit_type'       => $unit_type,
            'size_table'      => is_array($size_table_data) ? $size_table_data : array(),
        );
    }
    
    /**
     * Enqueue frontend scripts and styles
     */
    public function enqueue_frontend_scripts() {
        if (!is_product()) {
            return;
        }
        
        global $product;
        if (!$product) {
            return;
        }
        
        $is_size_product = get_post_meta($product->get_id(), '_is_size_product', true);
        if ($is_size_product !== 'yes') {
            return;
        }
        
        wp_enqueue_style(
            'size-manager-frontend',
            SIZE_MANAGER_PLUGIN_URL . 'assets/css/frontend.css',
            array(),
            SIZE_MANAGER_VERSION
        );
        
        wp_enqueue_script(
            'size-manager-frontend',
            SIZE_MANAGER_PLUGIN_URL . 'assets/js/frontend.js',
            array('jquery'),
            SIZE_MANAGER_VERSION,
            true
        );
        
        $size_table_data = get_post_meta($product->get_id(), '_size_table_data', true);
        $unit_type = get_post_meta($product->get_id(), '_size_unit_type', true);
        
        if (empty($unit_type)) {
            $unit_type = 'piece';
        }
        
        wp_localize_script('size-manager-frontend', 'sizeManagerFrontend', array(
            'productId'       => $product->get_id(),
            'sizeTable'       => is_array($size_table_data) ? $size_table_data : array(),
            'unitType'        => $unit_type,
            'currency'        => get_woocommerce_currency(),
            'currencySymbol'  => get_woocommerce_currency_symbol(),
            'strings'         => array(
                'selectSize'  => __('Please select a size', 'size-manager'),
                'perPiece'    => __('per piece', 'size-manager'),
                'perKg'       => __('per KG', 'size-manager'),
                'perMeter'    => __('per meter', 'size-manager'),
                'perLiter'    => __('per liter', 'size-manager'),
            ),
        ));
    }
    
    /**
     * Display size table on frontend product page
     */
    public function display_size_table_frontend() {
        // Prevent multiple displays
        static $displayed = false;
        if ($displayed) {
            return;
        }
        
        global $product;
        
        // Try to get product if not set
        if (!$product) {
            $product = wc_get_product(get_the_ID());
        }
        
        if (!$product || !is_object($product)) {
            return;
        }
        
        $product_id = $product->get_id();
        if (!$product_id) {
            return;
        }
        
        $is_size_product = get_post_meta($product_id, '_is_size_product', true);
        
        if ($is_size_product !== 'yes') {
            return;
        }
        
        $size_table_data = get_post_meta($product->get_id(), '_size_table_data', true);
        $unit_type = get_post_meta($product->get_id(), '_size_unit_type', true);
        
        if (empty($unit_type)) {
            $unit_type = 'piece';
        }
        
        if (empty($size_table_data) || !is_array($size_table_data)) {
            return;
        }
        
        // Get unit label
        $unit_labels = array(
            'piece' => __('units', 'size-manager'),
            'kg'    => __('KG', 'size-manager'),
            'meter' => __('meters', 'size-manager'),
            'liter' => __('liters', 'size-manager'),
        );
        $unit_label = isset($unit_labels[$unit_type]) ? $unit_labels[$unit_type] : __('units', 'size-manager');
        
        $price_labels = array(
            'piece' => __('per piece', 'size-manager'),
            'kg'    => __('per KG', 'size-manager'),
            'meter' => __('per meter', 'size-manager'),
            'liter' => __('per liter', 'size-manager'),
        );
        $price_label = isset($price_labels[$unit_type]) ? $price_labels[$unit_type] : '';
        
        ?>
        <div class="size-manager-frontend-table" id="size-manager-table">
            <h3><?php _e('Available Sizes & Quantities', 'size-manager'); ?></h3>
            
            <div class="size-selector-wrapper">
                <label for="size-selector"><?php _e('Select Size:', 'size-manager'); ?></label>
                <select id="size-selector" class="size-selector">
                    <option value=""><?php _e('-- Choose a size --', 'size-manager'); ?></option>
                    <?php foreach ($size_table_data as $index => $row): ?>
                        <option value="<?php echo esc_attr($index); ?>" 
                                data-price="<?php echo esc_attr($row['price']); ?>"
                                data-quantity="<?php echo esc_attr($row['quantity']); ?>">
                            <?php echo esc_html($row['size']); ?> - <?php echo wc_price($row['price']); ?> <?php echo esc_html($price_label); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
            
            <div class="selected-size-info" id="selected-size-info" style="display:none;">
                <p class="size-price">
                    <strong><?php _e('Price:', 'size-manager'); ?></strong> 
                    <span id="size-price-display"></span>
                </p>
                <p class="size-availability">
                    <strong><?php _e('Available:', 'size-manager'); ?></strong> 
                    <span id="size-quantity-display"></span> <?php echo esc_html($unit_label); ?>
                </p>
            </div>
            
            <table class="shop_table size-table-frontend">
                <thead>
                    <tr>
                        <th><?php _e('Size', 'size-manager'); ?></th>
                        <th><?php _e('Available', 'size-manager'); ?></th>
                        <th><?php _e('Price', 'size-manager'); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($size_table_data as $row): ?>
                        <tr>
                            <td><strong><?php echo esc_html($row['size']); ?></strong></td>
                            <td><?php echo esc_html($row['quantity']); ?> <?php echo esc_html($unit_label); ?></td>
                            <td><?php echo wc_price($row['price']); ?> <small><?php echo esc_html($price_label); ?></small></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <?php
        
        // Mark as displayed
        $displayed = true;
    }
}

/**
 * Initialize the plugin
 */
function size_manager_init() {
    return Size_Manager::get_instance();
}

// Start the plugin
add_action('plugins_loaded', 'size_manager_init');

/**
 * Shortcode to display size table manually
 * Usage: [size_table]
 */
function size_manager_shortcode($atts) {
    $plugin = Size_Manager::get_instance();
    
    ob_start();
    $plugin->display_size_table_frontend();
    return ob_get_clean();
}
add_shortcode('size_table', 'size_manager_shortcode');
