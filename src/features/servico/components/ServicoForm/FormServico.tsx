"use client";

import type { ServiceFormData } from "../../schemas/servicoSchema";
import { STATUS_OPCOES } from "@/constants";
import { FormTextField, FormSelectField } from "@/components/form";

export function FormServico() {
  return (
    <div className="flex gap-4">
      <div className="flex flex-1 flex-col gap-2">
        <FormTextField<ServiceFormData>
          name="nome"
          label="Serviço"
          placeholder="Serviço"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <FormSelectField<ServiceFormData>
          name="status"
          label="Status"
          options={STATUS_OPCOES}
        />
      </div>
    </div>
  );
}
