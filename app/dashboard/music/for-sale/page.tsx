import React from 'react';
import DashboardNav from '../../../components/DashboardNav';
import UploadForm from '../../../components/UploadForm';
import UploadedList from '../../../components/UploadedList';

export const metadata = {
  title: 'Music For Sale - Dashboard',
};

export default function ForSalePage() {
  return (
    <main style={{ padding: 24, maxWidth: 980 }}>
      <UploadForm section="for-sale" />
      <h1>Music for Sale</h1>
      <DashboardNav />

      <UploadedList section="for-sale" />
    </main>
  );
}
