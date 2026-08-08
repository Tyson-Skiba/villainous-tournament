import { ShieldAlert } from 'lucide-react'
import { useAuth } from '../hooks'
import { Button, CloseButton, StepHeader } from '../components'
import { useAppContext } from '../context'

import React, { ChangeEvent, useState } from 'react'
import { deleteBlob } from '../utils/db'

interface SignUpFormProps {
	openLoginView: () => void
}

const SignUpForm: React.FC<SignUpFormProps> = ({ openLoginView }) => {
	const { signUp } = useAuth()
	const [error, setError] = useState('')
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	})

	const handleChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [target.name]: target.value })
	}

	return (
		<div className="round-block">
			<div className="round-title">Create an account</div>
			<form
				onSubmit={async (e) => {
					e.preventDefault()
					const response = await signUp(formData.email, formData.password)

					if (response.error) setError(response.error.message)
				}}
				className="flex column padded"
			>
				<div>
					<div>
						<input
							className="field"
							type="email"
							name="email"
							required
							placeholder="Email address"
							value={formData.email}
							onChange={handleChange}
						/>
					</div>
				</div>
				<div>
					<div>
						<input
							className="field"
							type="password"
							name="password"
							placeholder="Password"
							required
							value={formData.password}
							onChange={handleChange}
						/>
					</div>
				</div>
				{error && (
					<div className="form-error">
						<ShieldAlert size={18} />
						{error}
					</div>
				)}
				<button className="button" type="submit">
					Sign Up
				</button>
				<div className="flex center">
					<div className="rule"></div>
					<span className="padded">or</span>
					<div className="rule"></div>
				</div>
				<span className="flex center">
					Already a member?&nbsp;
					<span className="link" onClick={openLoginView}>
						Login
					</span>
				</span>
			</form>
		</div>
	)
}

interface LoginFormProps {
	openSignUpView: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ openSignUpView }) => {
	const { signInWithEmail } = useAuth()
	const { setScreen } = useAppContext()
	const [error, setError] = useState('')
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	})
	const handleChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [target.name]: target.value })
	}

	return (
		<div className="round-block">
			<div className="round-title">Welcome back</div>
			<form
				onSubmit={async (e) => {
					e.preventDefault()
					const response = await signInWithEmail(
						formData.email,
						formData.password,
					)
					if (response.error) setError(response.error.message)
					else setScreen('players')
				}}
				className="flex column padded"
			>
				<div>
					<div>
						<input
							className="field"
							type="email"
							name="email"
							required
							placeholder="Email address"
							value={formData.email}
							onChange={handleChange}
						/>
					</div>
				</div>
				<div>
					<div>
						<input
							className="field"
							type="password"
							name="password"
							placeholder="Password"
							required
							value={formData.password}
							onChange={handleChange}
						/>
					</div>
				</div>
				{error && (
					<div className="form-error">
						<ShieldAlert size={18} />
						{error}
					</div>
				)}
				<button className="button" type="submit">
					Login
				</button>
				<div className="flex center">
					<div className="rule"></div>
					<span className="padded">or</span>
					<div className="rule"></div>
				</div>
				<span className="flex center">
					Don't have an account?&nbsp;
					<span className="link" onClick={openSignUpView}>
						Sign up now
					</span>
				</span>
			</form>
		</div>
	)
}

const SignOut = () => {
	const { user, signOut } = useAuth()

	if (!user) return null

	return (
		<div className="flex column gap-1">
			<h2 style={{ textAlign: 'center' }}>You are signed in as {user.email}</h2>
			<Button variant="secondary" onClick={() => signOut()}>
				Log out
			</Button>
			<Button
				variant="danger"
				onClick={() => {
					// TODO: Show warning
					//deleteBlob();
					alert('TODO')
				}}
			>
				Delete my data
			</Button>
		</div>
	)
}

export const LoginView: React.FC = () => {
	const { setOverlay } = useAppContext()
	const { user } = useAuth()
	const [mode, setMode] = useState<'new' | 'login'>('login')

	let display = <></>
	if (user) display = <SignOut />
	else
		display =
			mode === 'new' ? (
				<SignUpForm openLoginView={() => setMode('login')} />
			) : (
				<LoginForm openSignUpView={() => setMode('new')} />
			)

	return (
		<div className="overlay" role="dialog" aria-modal="true">
			<div className="drawer large">
				<CloseButton onClick={() => setOverlay(undefined)} />

				<StepHeader
					step="LOGIN"
					title="Store My Data"
					subtitle="Login to backup your data across devices"
				/>
				<div>{display}</div>
			</div>
		</div>
	)
}
