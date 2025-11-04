<?php
/**
 * Plugin Name: UpdatedSizeManager
 * Plugin URI: https://www.sqb-tunisie.com
 * Description: Automatically displays size tables on product pages with dynamic pricing
 * Version: 2.0.0
 * Author: SQB Tunisie
 * Author URI: https://www.sqb-tunisie.com
 * Text Domain: updated-size-manager
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * WC requires at least: 5.0
 * WC tested up to: 8.0
 *
 * @package UpdatedSizeManager
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('UPDATED_SIZE_MANAGER_VERSION', '2.0.0');
define('UPDATED_SIZE_MANAGER_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UPDATED_SIZE_MANAGER_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Main UpdatedSizeManager Class
 */
class UpdatedSizeManager {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        // Check if WooCommerce is active
        if (!class_exists('WooCommerce')) {
            add_action('admin_notices', array($this, 'woocommerce_missing_notice'));
            return;
        }
        
        $this->init_hooks();
    }
    
    public function woocommerce_missing_notice() {
        ?>
        <div class="error">
            <p><?php _e('UpdatedSizeManager requires WooCommerce to be installed and active.', 'updated-size-manager'); ?></p>
        </div>
        <?php
    }
    
    private function init_hooks() {
        // Declare WooCommerce compatibility
        add_action('before_woocommerce_init', array($this, 'declare_woocommerce_compatibility'));
        
        // Admin hooks
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_filter('woocommerce_product_data_tabs', array($this, 'add_size_table_tab'));
        add_action('woocommerce_product_data_panels', array($this, 'add_size_table_panel'));
        add_action('woocommerce_process_product_meta', array($this, 'save_size_table_data'));
        
        // Frontend hooks - FORCE DISPLAY
        add_action('woocommerce_before_add_to_cart_form', array($this, 'display_size_table'), 10);
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'));
        
        // REST API hooks
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('rest_api_init', array($this, 'add_size_table_to_product_api'));
    }
    
    public function declare_woocommerce_compatibility() {
        if (class_exists('\Automattic\WooCommerce\Utilities\FeaturesUtil')) {
            \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('custom_order_tables', __FILE__, true);
            \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('cart_checkout_blocks', __FILE__, true);
        }
    }
    
    public function enqueue_admin_scripts($hook) {
        if ('post.php' !== $hook && 'post-new.php' !== $hook) {
            return;
        }
        
        global $post;
        if (!$post || 'product' !== $post->post_type) {
            return;
        }
        
        wp_enqueue_style('updated-size-manager-admin', UPDATED_SIZE_MANAGER_PLUGIN_URL . 'assets/css/admin.css', array(), UPDATED_SIZE_MANAGER_VERSION);
        wp_enqueue_script('updated-size-manager-admin', UPDATED_SIZE_MANAGER_PLUGIN_URL . 'assets/js/admin.js', array('jquery'), UPDATED_SIZE_MANAGER_VERSION, true);
        
        wp_localize_script('updated-size-manager-admin', 'updatedSizeManagerData', array(
            'strings' => array(
                'confirmDelete' => __('Are you sure?', 'updated-size-manager'),
            )
        ));
    }
    
    public function add_size_table_tab($tabs) {
        $tabs['updated_size_table'] = array(
            'label'    => __('Size Table', 'updated-size-manager'),
            'target'   => 'updated_size_table_product_data',
            'class'    => array('show_if_simple', 'show_if_variable'),
            'priority' => 65,
        );
        return $tabs;
    }
    
    public function add_size_table_panel() {
        global $post;
        
        $is_size_product = get_post_meta($post->ID, '_is_size_product', true);
        $unit_type = get_post_meta($post->ID, '_size_unit_type', true);
        $size_table_data = get_post_meta($post->ID, '_size_table_data', true);
        
        if (empty($unit_type)) {
            $unit_type = 'piece';
        }
        
        if (!is_array($size_table_data)) {
            $size_table_data = array();
        }
        
        ?>
        <div id="updated_size_table_product_data" class="panel woocommerce_options_panel">
            <div class="options_group">
                <?php
                woocommerce_wp_checkbox(array(
                    'id'          => '_is_size_product',
                    'label'       => __('Enable Size Table', 'updated-size-manager'),
                    'description' => __('Check this to enable size table for this product', 'updated-size-manager'),
                    'value'       => $is_size_product === 'yes' ? 'yes' : 'no',
                ));
                ?>
            </div>
            
            <div id="updated_size_table_container" style="<?php echo ($is_size_product === 'yes') ? '' : 'display:none;'; ?>">
                <div class="options_group">
                    <?php
                    woocommerce_wp_select(array(
                        'id'          => '_size_unit_type',
                        'label'       => __('Unit Type', 'updated-size-manager'),
                        'value'       => $unit_type,
                        'options'     => array(
                            'piece' => __('Per Piece', 'updated-size-manager'),
                            'kg'    => __('Per Kilogram (KG)', 'updated-size-manager'),
                            'meter' => __('Per Meter', 'updated-size-manager'),
                            'liter' => __('Per Liter', 'updated-size-manager'),
                        ),
                    ));
                    ?>
                </div>
                
                <div class="options_group">
                    <p class="form-field">
                        <label><?php _e('Size & Quantity Table', 'updated-size-manager'); ?></label>
                        <button type="button" class="button button-primary" id="add_size_row">
                            <?php _e('Add Row', 'updated-size-manager'); ?>
                        </button>
                    </p>
                    
                    <div class="size-table-wrapper">
                        <table class="widefat size-table" id="size_table">
                            <thead>
                                <tr>
                                    <th><?php _e('Size', 'updated-size-manager'); ?></th>
                                    <th><?php _e('Quantity', 'updated-size-manager'); ?></th>
                                    <th><?php _e('Price', 'updated-size-manager'); ?> (<?php echo get_woocommerce_currency_symbol(); ?>)</th>
                                    <th><?php _e('Actions', 'updated-size-manager'); ?></th>
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
        
        <script type="text/template" id="size_row_template">
            <?php $this->render_size_row('{{INDEX}}', array('size' => '', 'quantity' => '', 'price' => '')); ?>
        </script>
        <?php
    }
    
    private function render_size_row($index, $data) {
        $size = isset($data['size']) ? esc_attr($data['size']) : '';
        $quantity = isset($data['quantity']) ? esc_attr($data['quantity']) : '';
        $price = isset($data['price']) ? esc_attr($data['price']) : '';
        ?>
        <tr class="size-row">
            <td>
                <input type="text" name="size_table[<?php echo $index; ?>][size]" value="<?php echo $size; ?>" placeholder="e.g., M8, 10mm" class="regular-text" />
            </td>
            <td>
                <input type="number" name="size_table[<?php echo $index; ?>][quantity]" value="<?php echo $quantity; ?>" placeholder="0" min="0" step="1" class="small-text" />
            </td>
            <td>
                <input type="number" name="size_table[<?php echo $index; ?>][price]" value="<?php echo $price; ?>" placeholder="0.00" min="0" step="0.01" class="small-text" />
            </td>
            <td>
                <button type="button" class="button remove-size-row"><?php _e('Remove', 'updated-size-manager'); ?></button>
            </td>
        </tr>
        <?php
    }
    
    public function save_size_table_data($post_id) {
        $is_size_product = isset($_POST['_is_size_product']) ? 'yes' : 'no';
        update_post_meta($post_id, '_is_size_product', $is_size_product);
        
        if (isset($_POST['_size_unit_type'])) {
            update_post_meta($post_id, '_size_unit_type', sanitize_text_field($_POST['_size_unit_type']));
        }
        
        if (isset($_POST['size_table']) && is_array($_POST['size_table'])) {
            $size_table_data = array();
            
            foreach ($_POST['size_table'] as $row) {
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
    
    public function enqueue_frontend_scripts() {
        if (!is_product()) {
            return;
        }
        
        wp_enqueue_style('updated-size-manager-frontend', UPDATED_SIZE_MANAGER_PLUGIN_URL . 'assets/css/frontend.css', array(), UPDATED_SIZE_MANAGER_VERSION);
        wp_enqueue_script('updated-size-manager-frontend', UPDATED_SIZE_MANAGER_PLUGIN_URL . 'assets/js/frontend.js', array('jquery'), UPDATED_SIZE_MANAGER_VERSION, true);
        
        global $product;
        if ($product) {
            $size_table_data = get_post_meta($product->get_id(), '_size_table_data', true);
            $unit_type = get_post_meta($product->get_id(), '_size_unit_type', true);
            
            wp_localize_script('updated-size-manager-frontend', 'updatedSizeManagerFrontend', array(
                'productId'      => $product->get_id(),
                'sizeTable'      => is_array($size_table_data) ? $size_table_data : array(),
                'unitType'       => $unit_type ? $unit_type : 'piece',
                'currencySymbol' => get_woocommerce_currency_symbol(),
            ));
        }
    }
    
    /**
     * AUTOMATIC DISPLAY - NO MANUAL INTERVENTION NEEDED
     */
    public function display_size_table() {
        // Only run on single product pages
        if (!is_product()) {
            return;
        }
        
        global $product;
        
        if (!$product) {
            $product = wc_get_product(get_the_ID());
        }
        
        if (!$product) {
            return;
        }
        
        $product_id = $product->get_id();
        $is_size_product = get_post_meta($product_id, '_is_size_product', true);
        
        // Debug: Uncomment to see if function is called
        // echo '<!-- UpdatedSizeManager: is_size_product = ' . $is_size_product . ' -->';
        
        if ($is_size_product !== 'yes') {
            return;
        }
        
        $size_table_data = get_post_meta($product_id, '_size_table_data', true);
        $unit_type = get_post_meta($product_id, '_size_unit_type', true);
        
        // Debug: Uncomment to see table data
        // echo '<!-- UpdatedSizeManager: size_table_data = ' . print_r($size_table_data, true) . ' -->';
        
        if (empty($size_table_data) || !is_array($size_table_data)) {
            return;
        }
        
        if (empty($unit_type)) {
            $unit_type = 'piece';
        }
        
        $unit_labels = array(
            'piece' => __('units', 'updated-size-manager'),
            'kg'    => __('KG', 'updated-size-manager'),
            'meter' => __('meters', 'updated-size-manager'),
            'liter' => __('liters', 'updated-size-manager'),
        );
        $unit_label = isset($unit_labels[$unit_type]) ? $unit_labels[$unit_type] : __('units', 'updated-size-manager');
        
        $price_labels = array(
            'piece' => __('per piece', 'updated-size-manager'),
            'kg'    => __('per KG', 'updated-size-manager'),
            'meter' => __('per meter', 'updated-size-manager'),
            'liter' => __('per liter', 'updated-size-manager'),
        );
        $price_label = isset($price_labels[$unit_type]) ? $price_labels[$unit_type] : '';
        
        ?>
        <div class="updated-size-manager-table" id="updated-size-manager-table">
            <h3><?php _e('Available Sizes & Quantities', 'updated-size-manager'); ?></h3>
            
            <div class="size-selector-wrapper">
                <label for="size-selector"><?php _e('Select Size:', 'updated-size-manager'); ?></label>
                <select id="size-selector" class="size-selector">
                    <option value=""><?php _e('-- Choose a size --', 'updated-size-manager'); ?></option>
                    <?php foreach ($size_table_data as $index => $row): ?>
                        <option value="<?php echo esc_attr($index); ?>" 
                                data-price="<?php echo esc_attr($row['price']); ?>"
                                data-quantity="<?php echo esc_attr($row['quantity']); ?>"
                                data-size="<?php echo esc_attr($row['size']); ?>">
                            <?php echo esc_html($row['size']); ?> - <?php echo wc_price($row['price']); ?> <?php echo esc_html($price_label); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
            
            <div class="selected-size-info" id="selected-size-info" style="display:none;">
                <p class="size-price">
                    <strong><?php _e('Price:', 'updated-size-manager'); ?></strong> 
                    <span id="size-price-display"></span>
                </p>
                <p class="size-availability">
                    <strong><?php _e('Available:', 'updated-size-manager'); ?></strong> 
                    <span id="size-quantity-display"></span> <?php echo esc_html($unit_label); ?>
                </p>
            </div>
            
            <table class="shop_table size-table-frontend">
                <thead>
                    <tr>
                        <th><?php _e('Size', 'updated-size-manager'); ?></th>
                        <th><?php _e('Available', 'updated-size-manager'); ?></th>
                        <th><?php _e('Price', 'updated-size-manager'); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($size_table_data as $index => $row): ?>
                        <tr data-index="<?php echo esc_attr($index); ?>">
                            <td><strong><?php echo esc_html($row['size']); ?></strong></td>
                            <td><?php echo esc_html($row['quantity']); ?> <?php echo esc_html($unit_label); ?></td>
                            <td><?php echo wc_price($row['price']); ?> <small><?php echo esc_html($price_label); ?></small></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <?php
    }
    
    public function register_rest_routes() {
        register_rest_route('siesta/v1', '/size-table/(?P<product_id>\d+)', array(
            'methods'             => 'GET',
            'callback'            => array($this, 'get_size_table_api'),
            'permission_callback' => '__return_true',
        ));
    }
    
    public function get_size_table_api($request) {
        $product_id = $request->get_param('product_id');
        $product = wc_get_product($product_id);
        
        if (!$product) {
            return new WP_Error('product_not_found', __('Product not found', 'updated-size-manager'), array('status' => 404));
        }
        
        $is_size_product = get_post_meta($product_id, '_is_size_product', true);
        
        if ($is_size_product !== 'yes') {
            return new WP_Error('not_size_product', __('Not a size product', 'updated-size-manager'), array('status' => 400));
        }
        
        $size_table_data = get_post_meta($product_id, '_size_table_data', true);
        $unit_type = get_post_meta($product_id, '_size_unit_type', true);
        
        return rest_ensure_response(array(
            'product_id'      => $product_id,
            'product_name'    => $product->get_name(),
            'product_sku'     => $product->get_sku(),
            'is_size_product' => true,
            'unit_type'       => $unit_type ? $unit_type : 'piece',
            'size_table'      => is_array($size_table_data) ? $size_table_data : array(),
            'currency'        => get_woocommerce_currency(),
            'currency_symbol' => get_woocommerce_currency_symbol(),
        ));
    }
    
    public function add_size_table_to_product_api() {
        register_rest_field('product', 'size_table_data', array(
            'get_callback' => array($this, 'get_product_size_table_field'),
            'schema'       => array(
                'description' => __('Size table data', 'updated-size-manager'),
                'type'        => 'object',
            ),
        ));
    }
    
    public function get_product_size_table_field($object) {
        $product_id = $object['id'];
        $is_size_product = get_post_meta($product_id, '_is_size_product', true);
        
        if ($is_size_product !== 'yes') {
            return null;
        }
        
        $size_table_data = get_post_meta($product_id, '_size_table_data', true);
        $unit_type = get_post_meta($product_id, '_size_unit_type', true);
        
        return array(
            'is_size_product' => true,
            'unit_type'       => $unit_type ? $unit_type : 'piece',
            'size_table'      => is_array($size_table_data) ? $size_table_data : array(),
        );
    }
}

function updated_size_manager_init() {
    return UpdatedSizeManager::get_instance();
}

add_action('plugins_loaded', 'updated_size_manager_init');

/**
 * Debug function - shows if plugin is loaded
 * Remove this after confirming plugin works
 */
function updated_size_manager_debug() {
    if (!is_product()) {
        return;
    }
    
    global $product;
    if (!$product) {
        $product = wc_get_product(get_the_ID());
    }
    
    if (!$product) {
        echo '<!-- UpdatedSizeManager: No product found -->';
        return;
    }
    
    $product_id = $product->get_id();
    $is_size_product = get_post_meta($product_id, '_is_size_product', true);
    $size_table_data = get_post_meta($product_id, '_size_table_data', true);
    
    echo '<!-- UpdatedSizeManager Debug -->';
    echo '<!-- Product ID: ' . $product_id . ' -->';
    echo '<!-- Is Size Product: ' . $is_size_product . ' -->';
    echo '<!-- Size Table Data: ' . (is_array($size_table_data) ? count($size_table_data) . ' rows' : 'empty') . ' -->';
    echo '<!-- Plugin Hook: woocommerce_before_add_to_cart_form -->';
    echo '<!-- UpdatedSizeManager Debug End -->';
}
add_action('woocommerce_before_add_to_cart_form', 'updated_size_manager_debug', 1);
