"use client";

import { FormSelectField, FormTextField } from "@/components/form";
import { STATUS_OPCOES } from "@/constants";
import type { ServiceFormData } from "../../schemas/servicoSchema";

export function FormServico() {
  return (
    <div className="flex gap-4">
      <div className="flex flex-1 flex-col gap-2 text-gray">
        <FormTextField<ServiceFormData>
          name="nome"
          label="Serviço"
          placeholder="Serviço"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 text-gray">
        <FormSelectField<ServiceFormData>
          name="status"
          label="Status"
          options={STATUS_OPCOES}
        />
      </div>
    </div>
  );
}
