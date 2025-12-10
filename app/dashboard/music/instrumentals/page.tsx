import React from 'react';
import DashboardNav from '../../../components/DashboardNav';
import UploadForm from '../../../components/UploadForm';
import UploadedList from '../../../components/UploadedList';

export const metadata = {
  title: 'Instrumentals - Dashboard',
};

export default function InstrumentalsPage() {
  return (
    <main style={{ padding: 24, maxWidth: 980 }}>
      <UploadForm section="instrumentals" />
      <h1>Full Instrumentals</h1>
      <DashboardNav />

      <UploadedList section="instrumentals" />
    </main>
  );
}
