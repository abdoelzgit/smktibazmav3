'use client'

import type { ComponentProps } from 'react'
import { PhoneInput } from '@/components/ui/phone-input'

type PhoneInput01Props = ComponentProps<typeof PhoneInput>

export const PhoneInput01 = (props: PhoneInput01Props) => {
  return <PhoneInput placeholder='Enter contact number' {...props} />
}

export default PhoneInput01
