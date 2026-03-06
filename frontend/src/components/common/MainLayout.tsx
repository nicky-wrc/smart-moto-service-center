import type { ReactNode } from 'react'
import './MainLayout.css'

interface Props {
    children: ReactNode
}

export default function MainLayout({ children }: Props) {
    return (
        <div className="main-layout-wrapper">
            {children}
        </div>
    )
}
