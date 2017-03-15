// region import
const View = require('./view')
const {CompositeDisposable, Disposable} = require('atom')
// endregion

// region Count
class Count {
	activate (state) {
		if (state) {
			atom.deserializers.deserialize(state)
		} else {
			this.count = 0
			this.key = 'none'
			this.fullKey = 'none'
		}
		this.format = atom.config.get('count.format')
		this.view = new View()
		this.view.initialize()

		// config change listeners
		atom.config.onDidChange('count.format', ({newValue}) => {
			this.format = newValue
			this.refresh()
		})

		// keypress listener
		const ref = this
		this.disposables = new CompositeDisposable()
		this.disposables.add(
			new Disposable(
				atom.views.getView(atom.workspace).addEventListener('keydown', event => {
					ref.count++
					ref.key = event.key

					// full keys
					const keys = []
					if (event.altKey) keys.push('alt')
					if (event.ctrlKey) keys.push('ctrl')
					if (event.metaKey) keys.push('command')
					if (event.shiftKey) keys.push('shift')
					keys.push(event.key)
					ref.fullKey = keys.join('+')

					// reload
					ref.refresh()
				})
			)
		)

		// render
		this.refresh()
	}

	refresh () {
		this.view.set(this.format
			.replace(/\%c/g, this.count)
			.replace(/\%f/g, this.fullKey)
			.replace(/\%k/g, this.key)
		)
	}

	deactivate () {
		this.subscriptions.dispose()
		this.view.destroy()
		this.statusBarTile.destroy() // TODO
	}

	addStatusBar (statusBar) {
		this.statusBar = statusBar
		this.statusBarTile = this.statusBar.addLeftTile({
			item: this.view,
			priority: 50
		})
	}

	parse ({count, fullKey, key}) {
		this.count = count
		this.fullKey = fullKey
		this.key = key
	}

	serialize () {
		return {
			count: this.count,
			deserializer: 'state',
			fullKey: this.fullKey,
			key: this.key
		}
	}
}
// endregion

// region config
const instance = new Count()
instance.config = {
	format: {
		type: 'string',
		default: '%c %f',
		description: 'Display format. %c = count, %k = key, %f = full key'
	}
}
// endregion

// region export
module.exports = instance
// endregion
