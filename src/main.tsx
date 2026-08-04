import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
import { AppProvider, GameProvider } from './context'

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<AppProvider>
			<GameProvider>
				<App />
			</GameProvider>
		</AppProvider>
	</React.StrictMode>,
)
