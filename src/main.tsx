import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppProvider, GameProvider, RouteProvider } from './context'
import App from './App'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<RouteProvider>
			<AppProvider>
				<GameProvider>
					<App />
				</GameProvider>
			</AppProvider>
		</RouteProvider>
	</React.StrictMode>,
)
