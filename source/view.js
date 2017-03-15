// region View
class View extends HTMLElement {

	initialize () {
		this.classList.add('count', 'inline-block')
		this.span = this.ownerDocument.createElement('span')
		this.span.classList.add('count-inner')
		this.appendChild(this.span)
	}

	set (text) {
		this.span.textContent = text
	}

}
// endregion

// region export
module.exports = document.registerElement('status-bar-count', {
	prototype: View.prototype,
	extends: 'div'
})
// endregion
