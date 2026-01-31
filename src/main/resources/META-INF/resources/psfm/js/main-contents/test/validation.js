import { setValidationInputChange, setValidation } from "/psfm/js/fragment/validation.js";
import { setFormFloatLabel } from '/psfm/js/fragment/form.js';
//ready関数
$(document).ready(function() {
	setValidationInputChange();
	setValidation();
	setFormFloatLabel();
})