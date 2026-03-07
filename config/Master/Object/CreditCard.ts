import { FormField } from "@/types/form/form"
import { YesOrNo } from "@/data/YesOrNo/YesOrNoTypes"

export const CreditCardConfig = (): FormField[] => [

  {
    name: "CARDNAME",
    label: "Card Name",
    type: "text",
    required: true,
    autoFocus: true,
    width: "200px",
    maxWidth: "200px",
    size: "xs",
    rounded: "full",
    placeholder: "Enter card name"
  },

  {
    name: "ACTIVE",
    label: "Active",
    required: true,
    width: "120px",
    maxWidth: "120px",
    rounded: "full",
    options: YesOrNo,
    type: "select",
    defaultValue: "Y",
    size: "xs"
  }

]