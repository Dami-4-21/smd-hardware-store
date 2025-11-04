/**
 * UpdatedSizeManager - Frontend JavaScript
 * Handles dynamic price updates when size is selected
 */
(function($) {
    'use strict';
    
    $(document).ready(function() {
        initSizeSelector();
    });
    
    /**
     * Initialize size selector functionality
     */
    function initSizeSelector() {
        const $sizeSelector = $('#size-selector');
        const $sizeInfo = $('#selected-size-info');
        const $priceDisplay = $('#size-price-display');
        const $quantityDisplay = $('#size-quantity-display');
        const $productPrice = $('.product .price, .summary .price').first();
        
        if ($sizeSelector.length === 0) {
            return;
        }
        
        // Store original price
        const originalPrice = $productPrice.html();
        
        // Handle size selection
        $sizeSelector.on('change', function() {
            const $selectedOption = $(this).find('option:selected');
            const price = $selectedOption.data('price');
            const quantity = $selectedOption.data('quantity');
            
            if ($(this).val() === '') {
                // No size selected - hide info and restore original price
                $sizeInfo.slideUp();
                $productPrice.html(originalPrice);
                return;
            }
            
            // Update price display
            updatePriceDisplay(price, quantity);
            
            // Show size info
            $sizeInfo.slideDown();
            
            // Update main product price
            updateProductPrice(price);
        });
        
        /**
         * Update price and quantity display
         */
        function updatePriceDisplay(price, quantity) {
            const formattedPrice = formatPrice(price);
            const unitLabel = getUnitLabel();
            
            $priceDisplay.html(formattedPrice + ' <small>' + unitLabel + '</small>');
            $quantityDisplay.text(quantity);
        }
        
        /**
         * Update main product price
         */
        function updateProductPrice(price) {
            const formattedPrice = formatPrice(price);
            const unitLabel = getUnitLabel();
            
            $productPrice.html(
                '<span class="woocommerce-Price-amount amount">' +
                '<bdi>' + formattedPrice + '</bdi>' +
                '</span> ' +
                '<small class="size-unit-label">' + unitLabel + '</small>'
            );
        }
        
        /**
         * Format price with currency symbol
         */
        function formatPrice(price) {
            const symbol = updatedSizeManagerFrontend.currencySymbol;
            const formattedValue = parseFloat(price).toFixed(2);
            
            return '<span class="woocommerce-Price-currencySymbol">' + symbol + '</span>' + formattedValue;
        }
        
        /**
         * Get unit label based on unit type
         */
        function getUnitLabel() {
            const unitType = updatedSizeManagerFrontend.unitType;
            
            const labels = {
                'piece': 'per piece',
                'kg': 'per KG',
                'meter': 'per meter',
                'liter': 'per liter'
            };
            
            return labels[unitType] || 'per piece';
        }
        
        // Highlight selected row in table
        $sizeSelector.on('change', function() {
            const selectedIndex = $(this).val();
            
            // Remove previous highlights
            $('.size-table-frontend tbody tr').removeClass('selected-size');
            
            if (selectedIndex !== '') {
                // Highlight selected row
                $('.size-table-frontend tbody tr').eq(selectedIndex).addClass('selected-size');
            }
        });
    }
    
})(jQuery);
