// ====================================
// BlueWave Eco Solutions - Form Validation
// ====================================

class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.fields = {};
        
        if (this.form) {
            this.init();
        }
    }
    
    init() {
        // Store all form fields
        this.form.querySelectorAll('input, textarea, select').forEach(field => {
            if (field.name) {
                this.fields[field.name] = {
                    element: field,
                    rules: this.getValidationRules(field),
                    errors: []
                };
                
                // Add real-time validation
                field.addEventListener('blur', () => this.validateField(field.name));
                field.addEventListener('input', () => {
                    if (field.classList.contains('error')) {
                        this.validateField(field.name);
                    }
                });
            }
        });
        
        // Handle form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    getValidationRules(field) {
        const rules = {};
        
        // Check for required attribute
        if (field.hasAttribute('required')) {
            rules.required = true;
        }
        
        // Check for specific input types
        const type = field.getAttribute('type');
        if (type === 'email') {
            rules.email = true;
        } else if (type === 'tel') {
            rules.phone = true;
        } else if (type === 'number') {
            rules.number = true;
        }
        
        // Check for min/max attributes
        if (field.hasAttribute('minlength')) {
            rules.minlength = parseInt(field.getAttribute('minlength'));
        }
        if (field.hasAttribute('maxlength')) {
            rules.maxlength = parseInt(field.getAttribute('maxlength'));
        }
        if (field.hasAttribute('min')) {
            rules.min = parseInt(field.getAttribute('min'));
        }
        if (field.hasAttribute('max')) {
            rules.max = parseInt(field.getAttribute('max'));
        }
        
        // Check for data-validate attribute for custom rules
        const customRules = field.getAttribute('data-validate');
        if (customRules) {
            customRules.split(',').forEach(rule => {
                const trimmedRule = rule.trim();
                if (trimmedRule === 'phone') {
                    rules.phone = true;
                } else if (trimmedRule === 'email') {
                    rules.email = true;
                }
            });
        }
        
        return rules;
    }
    
    validateField(fieldName) {
        const fieldData = this.fields[fieldName];
        const field = fieldData.element;
        const value = field.value.trim();
        const rules = fieldData.rules;
        
        fieldData.errors = [];
        
        // Required validation
        if (rules.required && value === '') {
            fieldData.errors.push(`${this.getFieldLabel(field)} is required.`);
        }
        
        // Only validate other rules if field has a value or is required
        if (value !== '' || rules.required) {
            // Email validation
            if (rules.email && value !== '') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    fieldData.errors.push('Please enter a valid email address.');
                }
            }
            
            // Phone validation
            if (rules.phone && value !== '') {
                // Accept various phone formats
                const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
                if (!phoneRegex.test(value)) {
                    fieldData.errors.push('Please enter a valid phone number (at least 10 digits).');
                }
            }
            
            // Number validation
            if (rules.number && value !== '') {
                if (isNaN(value)) {
                    fieldData.errors.push('Please enter a valid number.');
                }
            }
            
            // Min length validation
            if (rules.minlength && value.length < rules.minlength) {
                fieldData.errors.push(`Minimum ${rules.minlength} characters required.`);
            }
            
            // Max length validation
            if (rules.maxlength && value.length > rules.maxlength) {
                fieldData.errors.push(`Maximum ${rules.maxlength} characters allowed.`);
            }
            
            // Min value validation
            if (rules.min !== undefined && !isNaN(value) && parseInt(value) < rules.min) {
                fieldData.errors.push(`Value must be at least ${rules.min}.`);
            }
            
            // Max value validation
            if (rules.max !== undefined && !isNaN(value) && parseInt(value) > rules.max) {
                fieldData.errors.push(`Value must be at most ${rules.max}.`);
            }
        }
        
        // Update field display
        this.updateFieldDisplay(fieldName);
        
        return fieldData.errors.length === 0;
    }
    
    updateFieldDisplay(fieldName) {
        const fieldData = this.fields[fieldName];
        const field = fieldData.element;
        const errorContainer = field.parentElement.querySelector('.error-message');
        
        if (fieldData.errors.length > 0) {
            field.classList.add('error');
            if (errorContainer) {
                errorContainer.textContent = fieldData.errors[0];
                errorContainer.classList.add('show');
            }
        } else {
            field.classList.remove('error');
            if (errorContainer) {
                errorContainer.classList.remove('show');
            }
        }
    }
    
    validateForm() {
        let isValid = true;
        
        Object.keys(this.fields).forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        if (this.validateForm()) {
            // Form is valid - you can submit it here
            console.log('Form is valid. Submitting...');
            
            // Collect form data
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData);
            
            console.log('Form Data:', data);
            
            // Show success message
            showNotification('✓ Message sent successfully! We\'ll get back to you soon.', 'success');
            
            // Reset form
            this.form.reset();
            
            // Clear any errors
            Object.keys(this.fields).forEach(fieldName => {
                this.fields[fieldName].element.classList.remove('error');
                const errorContainer = this.fields[fieldName].element.parentElement.querySelector('.error-message');
                if (errorContainer) {
                    errorContainer.classList.remove('show');
                }
            });
        } else {
            console.log('Form has validation errors');
            showNotification('Please fix the errors in the form.', 'error');
        }
    }
    
    getFieldLabel(field) {
        const label = field.parentElement.querySelector('label');
        return label ? label.textContent.replace('*', '').trim() : field.name;
    }
    
    reset() {
        this.form.reset();
        Object.keys(this.fields).forEach(fieldName => {
            this.fields[fieldName].errors = [];
            this.updateFieldDisplay(fieldName);
        });
    }
}

// Initialize form validators when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize contact form validation
    const contactForm = new FormValidator('contactForm');
    
    // Example: You can add custom validation messages or logic here
    // contactForm.fields['name'].customMessage = 'Please enter your full name';
});

// Helper function - might be defined in main.js, but adding here for safety
if (typeof showNotification === 'undefined') {
    function showNotification(message, type = 'success', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : '#f44336'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
}
