import ProgressIndicator from './ProgressIndicator'
import type { ReceptionistStep } from '../../types'
import './ReceptionistHeader.css'

interface Props {
  currentStep: ReceptionistStep
}

export default function ReceptionistHeader({ currentStep }: Props) {
  return (
    <header className="receptionist-header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo-text-container">
            <h1>Smart Moto Service Center</h1>
            <p className="subtitle">ระบบต้อนรับลูกค้า</p>
          </div>
        </div>
      </div>
    </header>
  )
}
