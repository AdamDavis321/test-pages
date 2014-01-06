function Validator() {
	this.isDateFn = isDateUSA;
	this.isDateTimeFn = function(value) {
		return (parseDateTimeUSA(value) !== null);
	};
}
Validator.prototype = {
	showErrorStatus : function(input, message) {
		if (message) {
			input.addClass('InError');
			input.attr('title', message);
		} else {
			input.removeClass('InError');
			input.removeAttr('title');
		}
	},

	verifyDate : function(input, message) {
		var me = this;
		var value = input.val();
		var okay = (!value || me.isDateFn(value));
		me.showErrorStatus(input, (!okay? message : ''));
		return okay;
	},

	verifyDateTime : function(input, message) {
		var me = this;
		var value = input.val();
		var okay = (!value || me.isDateTimeFn(value));
		me.showErrorStatus(input, (!okay? message : ''));
		return okay;
	},

	verifyNumeric : function(input, message) {
		var me = this;
		var value = input.val();
		var okay = (!value || !isNaN(value));
		me.showErrorStatus(input, (!okay? message : ''));
		return okay;
	},

	verifyRequired : function(input, message) {
		var me = this;
		var value = input.val();
		var okay = (value && $.trim(value));
		me.showErrorStatus(input, (!okay? message : ''));
		return okay;
	}
};
