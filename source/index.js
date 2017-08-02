// region import
const View = require('./view')
const { CompositeDisposable, Disposable } = require('atom')
// endregion

// region Count
class Count {
	activate() {
		this.altKey = 'none'
		this.ctrlKey = 'none'
		this.key = 'none'
		this.keyUp = false
		this.metaKey = 'none'
		this.shiftKey = 'none'

		this.fullKeys = 'none'
		this.macKeys = 'none'

		this.format = atom.config.get('count.format')
		this.ignoreRepeatedKeys = atom.config.get('count.ignoreRepeatedKeys')
		this.view = new View()
		this.view.initialize()

		// config change listeners
		atom.config.onDidChange('count.format', ({ newValue }) => {
			this.format = newValue
			this.refresh()
		})
		atom.config.onDidChange('count.ignoreRepeatedKeys', ({ newValue }) => {
			this.ignoreRepeatedKeys = newValue
			this.refresh()
		})

		// keypress listener
		const ref = this
		this.disposables = new CompositeDisposable()
		this.disposables.add(
			new Disposable(
				atom.views.getView(atom.workspace).addEventListener('keyup', event => {
					ref.keyUp = true
				})
			)
		)
		this.disposables.add(
			new Disposable(
				atom.views
					.getView(atom.workspace)
					.addEventListener('keydown', event => {
						// ignore repeat keys
						if (
							ref.ignoreRepeatedKeys &&
							!ref.keyUp &&
							ref.altKey === event.altKey &&
							ref.ctrlKey === event.ctrlKey &&
							ref.key === event.key &&
							ref.metaKey === event.metaKey &&
							ref.shiftKey === event.shiftKey
						)
							return

						// increment count
						atom.config.set('count.amount', atom.config.get('count.amount') + 1)

						// single key
						ref.key = event.key
						ref.altKey = event.altKey
						ref.ctrlKey = event.ctrlKey
						ref.metaKey = event.metaKey
						ref.shiftKey = event.shiftKey
						ref.keyUp = false

						// full keys
						const fullKeys = []
						if (event.altKey) fullKeys.push('alt')
						if (event.ctrlKey) fullKeys.push('ctrl')
						if (event.metaKey) fullKeys.push('meta')
						if (event.shiftKey) fullKeys.push('shift')

						if (!['Alt', 'Control', 'Meta', 'Shift'].includes(event.key))
							fullKeys.push(event.key)

						fullKeys.push(event.key)
						ref.fullKeys = fullKeys.join('+')

						// mac keys
						const macKeys = []
						if (event.ctrlKey) macKeys.push('⌃')
						if (event.altKey) macKeys.push('⌥')
						if (event.shiftKey) macKeys.push('⇧')
						if (event.metaKey) macKeys.push('⌘')

						const macMap = {
							ArrowDown: '↓',
							ArrowLeft: '←',
							ArrowRight: '→',
							ArrowUp: '↑',
							Backspace: '⌫',
							Enter: '⏎',
							Escape: '⎋',
						}
						if (!['Alt', 'Control', 'Meta', 'Shift'].includes(event.key))
							macKeys.push(macMap[event.key] || event.key)

						ref.macKeys = macKeys.join('')

						// reload
						ref.refresh()
					})
			)
		)

		// render
		this.refresh()
	}

	refresh() {
		this.view.set(
			this.format
				.replace(/\%c/g, atom.config.get('count.amount'))
				.replace(/\%f/g, this.fullKeys)
				.replace(/\%m/g, this.macKeys)
				.replace(/\%k/g, this.key)
		)
	}

	deactivate() {
		this.subscriptions.dispose()
		this.view.destroy()
		this.statusBarTile.destroy() // TODO
	}

	addStatusBar(statusBar) {
		this.statusBar = statusBar
		this.statusBarTile = this.statusBar.addLeftTile({
			item: this.view,
			priority: 50,
		})
	}
}
// endregion

// region config
const instance = new Count()
instance.config = {
	ignoreRepeatedKeys: {
		type: 'boolean',
		default: true,
		description: 'Ignore holding down keys.',
	},
	format: {
		type: 'string',
		default: '%c %m',
		description:
			'Display format. %c = count, %k = last key, %m = mac full keys, %f = full keys',
	},
	amount: {
		type: 'integer',
		default: 0,
		description: 'Current count.',
	},
}
// endregion

// region export
module.exports = instance
// endregion
