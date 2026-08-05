import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppProvider, GameProvider } from './context'
import App from './App'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<AppProvider>
			<GameProvider>
				<App />
			</GameProvider>
		</AppProvider>
	</React.StrictMode>,
)
