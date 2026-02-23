import type { ReceptionistStep } from '../../types'
import './ProgressIndicator.css'

interface Props {
  currentStep: ReceptionistStep
}

export default function ProgressIndicator({ currentStep }: Props) {
  return (
    <div className="progress-indicator-container">
      <div className="progress-steps">
        <div className={`progress-step ${currentStep === 'check' ? 'active' : currentStep === 'search' || currentStep === 'register' || currentStep === 'confirm' ? 'completed' : ''}`}>
          <div className="step-circle">1</div>
          <div className="step-label">ตรวจสอบ</div>
        </div>

        <div className="progress-connector"></div>

        <div className={`progress-step ${currentStep === 'search' || currentStep === 'register' ? 'active' : currentStep === 'confirm' ? 'completed' : ''}`}>
          <div className="step-circle">2</div>
          <div className="step-label">ลงทะเบียน</div>
        </div>

        <div className="progress-connector"></div>

        <div className={`progress-step ${currentStep === 'confirm' ? 'active' : ''}`}>
          <div className="step-circle">3</div>
          <div className="step-label">ยืนยัน</div>
        </div>
      </div>
    </div>
  )
}
