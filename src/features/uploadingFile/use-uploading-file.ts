"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { useAuthStore } from "@/shared/store/auth-store";

interface UploadFileInput {
  medicalRecordId: string;
  file: File;
}

export function useUploadingFile() {
  const queryClient = useQueryClient();
  const clinicId = useAuthStore((s) => s.clinicId);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({ medicalRecordId, file }: UploadFileInput) => {
      const supabase = createClient();
      const path = `${clinicId}/${medicalRecordId}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("medical-files")
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from("medical_files")
        .insert({
          clinic_id: clinicId!,
          medical_record_id: medicalRecordId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: path,
          uploaded_by: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-records"] });
    },
  });
}
