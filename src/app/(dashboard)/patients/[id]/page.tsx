"use client";

import { use } from "react";
import { useGetPatient } from "@/entities/patient";
import { Loading, Tabs, TabList, Tab, TabPanel } from "@/shared/ui";
import { PatientHeader, PatientInfoTab, PatientRecordsTab, PatientAppointmentsTab, PatientBillingTab } from "@/widgets/patient-detail";

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: patient, isLoading } = useGetPatient(id);

  if (isLoading) return <Loading className="py-20" />;
  if (!patient) return <div className="py-20 text-center text-muted-foreground">환자를 찾을 수 없습니다</div>;

  return (
    <div className="space-y-4">
      <PatientHeader patient={patient} />
      <Tabs defaultValue="info">
        <TabList>
          <Tab value="info">기본정보</Tab>
          <Tab value="records">진료기록</Tab>
          <Tab value="appointments">예약내역</Tab>
          <Tab value="billing">수납내역</Tab>
        </TabList>
        <TabPanel value="info">
          <PatientInfoTab patient={patient} />
        </TabPanel>
        <TabPanel value="records">
          <PatientRecordsTab patientId={id} />
        </TabPanel>
        <TabPanel value="appointments">
          <PatientAppointmentsTab patientId={id} />
        </TabPanel>
        <TabPanel value="billing">
          <PatientBillingTab patientId={id} />
        </TabPanel>
      </Tabs>
    </div>
  );
}
