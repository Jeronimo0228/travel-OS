"use client";

import { fieldClass, labelClass } from "@/components/ui/styles";

export function PasswordFields({
  password,
  confirm,
  onChange,
}: {
  password: string;
  confirm: string;
  onChange: (next: { password: string; confirm: string }) => void;
}) {
  return (
    <>
      <div>
        <label htmlFor="new-password" className={labelClass}>
          Nueva contraseña (mínimo 8 caracteres)
        </label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          value={password}
          onChange={(e) => onChange({ password: e.target.value, confirm })}
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="confirm-password" className={labelClass}>
          Repite la contraseña
        </label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => onChange({ password, confirm: e.target.value })}
          className={fieldClass}
        />
      </div>
    </>
  );
}
