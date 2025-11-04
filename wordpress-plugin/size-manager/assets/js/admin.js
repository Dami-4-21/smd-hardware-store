/**
 * Size Manager - Admin JavaScript
 */
(function($) {
    'use strict';
    
    let rowIndex = 0;
    
    $(document).ready(function() {
        initSizeManager();
    });
    
    /**
     * Initialize Size Manager
     */
    function initSizeManager() {
        // Set initial row index based on existing rows
        rowIndex = $('#size_table_body tr').length;
        
        // Toggle size table visibility based on checkbox
        $('#_is_size_product').on('change', function() {
            if ($(this).is(':checked')) {
                $('#size_table_container').slideDown();
            } else {
                $('#size_table_container').slideUp();
            }
        });
        
        // Add new row
        $('#add_size_row').on('click', function(e) {
            e.preventDefault();
            addSizeRow();
        });
        
        // Remove row (delegated event)
        $('#size_table_body').on('click', '.remove-size-row', function(e) {
            e.preventDefault();
            removeSizeRow($(this));
        });
        
        // Validate inputs
        $('#size_table_body').on('input', 'input[type="number"]', function() {
            validateNumberInput($(this));
        });
    }
    
    /**
     * Add a new size row
     */
    function addSizeRow() {
        const template = $('#size_row_template').html();
        const newRow = template.replace(/\{\{INDEX\}\}/g, rowIndex);
        
        $('#size_table_body').append(newRow);
        rowIndex++;
        
        // Focus on the size input of the new row
        $('#size_table_body tr:last-child input[type="text"]').focus();
    }
    
    /**
     * Remove a size row
     */
    function removeSizeRow($button) {
        if (confirm(sizeManagerData.strings.confirmDelete)) {
            $button.closest('tr').fadeOut(300, function() {
                $(this).remove();
                
                // If no rows left, add one empty row
                if ($('#size_table_body tr').length === 0) {
                    addSizeRow();
                }
            });
        }
    }
    
    /**
     * Validate number inputs
     */
    function validateNumberInput($input) {
        const value = parseFloat($input.val());
        const min = parseFloat($input.attr('min')) || 0;
        const step = parseFloat($input.attr('step')) || 1;
        
        if (value < min) {
            $input.val(min);
        }
        
        // Round to step precision
        if (step < 1) {
            const decimals = step.toString().split('.')[1]?.length || 0;
            $input.val(value.toFixed(decimals));
        }
    }
    
})(jQuery);
