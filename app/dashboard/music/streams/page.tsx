import React from 'react';
import DashboardNav from '../../../components/DashboardNav';
import UploadForm from '../../../components/UploadForm';
import UploadedList from '../../../components/UploadedList';

export const metadata = {
  title: 'Streams - Dashboard',
};

export default function StreamsPage() {
  return (
    <main style={{ padding: 24, maxWidth: 980 }}>
      <UploadForm section="streams" />
      <h1>Streams</h1>
      <DashboardNav />

      <UploadedList section="streams" />
    </main>
  );
}
