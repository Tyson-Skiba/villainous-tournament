import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/sw.js').then((registration) => {
			registration.update()

			registration.onupdatefound = () => {
				const installingWorker = registration.installing
				if (installingWorker) {
					installingWorker.onstatechange = () => {
						if (
							installingWorker.state === 'installed' &&
							navigator.serviceWorker.controller
						) {
							console.log('New content available; reloading page...')
							window.location.reload()
						}
					}
				}
			}
		})
	})
}

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
)
