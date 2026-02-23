import { useState } from 'react'
import type { ICustomer, ReceptionistStep } from '../types'
import StepInitial from '../components/service-advisor/StepInitial'
import StepSearch from '../components/service-advisor/StepSearch'
import StepRegister from '../components/service-advisor/StepRegister'
import StepConfirm from '../components/service-advisor/StepConfirm'
import ReceptionistHeader from '../components/common/ReceptionistHeader'
import ReceptionistFooter from '../components/common/ReceptionistFooter'
import './ReceptionistPage.css'

interface Props {
  onOpenHistory?: () => void
  onLogout?: () => void
}

export default function ReceptionistPage({ onOpenHistory, onLogout }: Props) {
  const [step, setStep] = useState<ReceptionistStep>('check')
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null)

  const handleSelectExisting = () => {
    setStep('search')
  }

  const handleSelectNew = () => {
    setStep('register')
    setSelectedCustomer(null)
  }

  const handleCustomerFound = (customer: ICustomer) => {
    setSelectedCustomer(customer)
    setStep('confirm')
  }

  const handleCustomerCreated = (customer: ICustomer) => {
    setSelectedCustomer(customer)
    setStep('confirm')
  }

  const handleBack = () => {
    setStep('check')
    setSelectedCustomer(null)
  }

  const handleConfirm = () => {
    // ส่งข้อมูลให้หัวหน้าช่าง
    setStep('check')
    setSelectedCustomer(null)
  }

  return (
    <div className="receptionist-page">
      <div className="receptionist-container">
        {/* Header */}
        <ReceptionistHeader currentStep={step} />

        {/* Main Content */}
        <main className="receptionist-main">
          {step === 'check' && <StepInitial onSelectExisting={handleSelectExisting} onSelectNew={handleSelectNew} />}

          {step === 'search' && <StepSearch onCustomerFound={handleCustomerFound} onBack={handleBack} />}

          {step === 'register' && <StepRegister onCustomerCreated={handleCustomerCreated} onBack={handleBack} />}

          {step === 'confirm' && selectedCustomer && (
            <StepConfirm customer={selectedCustomer} onConfirm={handleConfirm} onBack={handleBack} />
          )}
        </main>

        {/* Footer */}
        <ReceptionistFooter />
      </div>
    </div>
  )
}

