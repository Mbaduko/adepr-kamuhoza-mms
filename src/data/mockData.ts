import { UserRole } from '@/context/AuthContext';

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  address: string;
  zoneId: string;
  isChoirMember: boolean;
  accountStatus: 'active' | 'inactive';
  profileImage?: string;
  sacraments: {
    baptism?: { date: string; place: string };
    recommendation?: { date: string; place: string };
    marriage?: { date: string; spouse: string; place: string };
  };
}

export interface Zone {
  id: string;
  name: string;
  leaderId?: string;
  description: string;
  memberCount: number;
}

export interface CertificateRequest {
  id: string;
  memberId: string;
  memberName: string;
  certificateType: 'baptism' | 'recommendation' | 'marriage' | 'membership';
  purpose: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'in-review';
  approvals: {
    level1?: { approvedBy: string; date: string; comments?: string };
    level2?: { approvedBy: string; date: string; comments?: string };
    level3?: { approvedBy: string; date: string; comments?: string };
  };
  rejectionReason?: string;
}

export const mockMembers: Member[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1234567890',
    dateOfBirth: '1985-05-15',
    gender: 'male',
    maritalStatus: 'married',
    address: '123 Faith Street, City',
    zoneId: 'zone-1',
    isChoirMember: true,
    accountStatus: 'active',
    sacraments: {
      baptism: { date: '1985-06-01', place: 'St. Mary Church' },
      recommendation: { date: '2000-04-15', place: 'St. Mary Church' },
      marriage: { date: '2010-07-20', spouse: 'Jane Smith', place: 'St. Mary Church' }
    }
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1234567891',
    dateOfBirth: '1990-08-22',
    gender: 'female',
    maritalStatus: 'single',
    address: '456 Hope Avenue, City',
    zoneId: 'zone-1',
    isChoirMember: false,
    accountStatus: 'active',
    sacraments: {
      baptism: { date: '1990-09-01', place: 'St. Peter Church' },
      recommendation: { date: '2005-05-10', place: 'St. Peter Church' }
    }
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.brown@email.com',
    phone: '+1234567892',
    dateOfBirth: '1975-03-10',
    gender: 'male',
    maritalStatus: 'married',
    address: '789 Grace Road, City',
    zoneId: 'zone-2',
    isChoirMember: true,
    accountStatus: 'active',
    sacraments: {
      baptism: { date: '1975-04-01', place: 'Holy Spirit Church' },
      recommendation: { date: '1990-03-25', place: 'Holy Spirit Church' }
    }
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '+1234567893',
    dateOfBirth: '1988-11-05',
    gender: 'female',
    maritalStatus: 'divorced',
    address: '321 Peace Lane, City',
    zoneId: 'zone-2',
    isChoirMember: false,
    accountStatus: 'inactive',
    sacraments: {
      baptism: { date: '1988-12-01', place: 'Our Lady Church' }
    }
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david.wilson@email.com',
    phone: '+1234567894',
    dateOfBirth: '1982-07-12',
    gender: 'male',
    maritalStatus: 'married',
    address: '654 Faith Avenue, City',
    zoneId: 'zone-1',
    isChoirMember: true,
    accountStatus: 'active',
    sacraments: {
      baptism: { date: '1982-08-01', place: 'St. Mary Church' },
      recommendation: { date: '1997-06-15', place: 'St. Mary Church' },
      marriage: { date: '2015-09-10', spouse: 'Maria Wilson', place: 'St. Mary Church' }
    }
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@email.com',
    phone: '+1234567895',
    dateOfBirth: '1995-03-20',
    gender: 'female',
    maritalStatus: 'single',
    address: '987 Hope Street, City',
    zoneId: 'zone-3',
    isChoirMember: false,
    accountStatus: 'active',
    sacraments: {
      baptism: { date: '1995-04-15', place: 'Holy Spirit Church' },
      recommendation: { date: '2010-05-20', place: 'Holy Spirit Church' }
    }
  },
  {
    id: '7',
    name: 'Robert Taylor',
    email: 'robert.taylor@email.com',
    phone: '+1234567896',
    dateOfBirth: '1980-12-08',
    gender: 'male',
    maritalStatus: 'married',
    address: '456 Faith Lane, City',
    zoneId: 'zone-1',
    isChoirMember: false,
    accountStatus: 'active',
    sacraments: {
      baptism: { date: '1981-01-15', place: 'St. Mary Church' }
    }
  },
  {
    id: '8',
    name: 'Jennifer White',
    email: 'jennifer.white@email.com',
    phone: '+1234567897',
    dateOfBirth: '1978-06-14',
    gender: 'female',
    maritalStatus: 'married',
    address: '789 Grace Avenue, City',
    zoneId: 'zone-2',
    isChoirMember: true,
    accountStatus: 'active',
    sacraments: {
      baptism: { date: '1978-07-01', place: 'Holy Spirit Church' },
      recommendation: { date: '1993-05-10', place: 'Holy Spirit Church' }
    }
  }
];

export const mockZones: Zone[] = [
  {
    id: 'zone-1',
    name: 'North Zone',
    leaderId: '2',
    description: 'Northern area of the parish',
    memberCount: 45
  },
  {
    id: 'zone-2',
    name: 'South Zone',
    leaderId: '3',
    description: 'Southern area of the parish',
    memberCount: 38
  },
  {
    id: 'zone-3',
    name: 'East Zone',
    description: 'Eastern area of the parish',
    memberCount: 25
  },
  {
    id: 'zone-4',
    name: 'West Zone',
    description: 'Western area of the parish',
    memberCount: 32
  }
];

export const mockCertificateRequests: CertificateRequest[] = [
  {
    id: 'cert-1',
    memberId: '1',
    memberName: 'John Smith',
    certificateType: 'baptism',
    purpose: 'For marriage documentation',
    requestDate: '2024-01-15',
    status: 'approved',
    approvals: {
      level1: { approvedBy: 'Sarah Johnson', date: '2024-01-16', comments: 'Documents verified' },
      level2: { approvedBy: 'Rev. Michael Brown', date: '2024-01-17', comments: 'Approved for processing' },
      level3: { approvedBy: 'Rev. Dr. David Wilson', date: '2024-01-18', comments: 'Parish Pastor approval granted' }
    }
  },
  {
    id: 'cert-2',
    memberId: '2',
    memberName: 'Sarah Johnson',
    certificateType: 'recommendation',
    purpose: 'Employment requirement',
    requestDate: '2024-01-20',
    status: 'pending',
    approvals: {}
  },
  {
    id: 'cert-3',
    memberId: '3',
    memberName: 'Michael Brown',
    certificateType: 'membership',
    purpose: 'Transfer to another parish',
    requestDate: '2024-01-25',
    status: 'in-review',
    approvals: {
      level1: { approvedBy: 'Sarah Johnson', date: '2024-01-26', comments: 'Initial review complete' }
    }
  },
  {
    id: 'cert-4',
    memberId: '4',
    memberName: 'Emily Davis',
    certificateType: 'baptism',
    purpose: 'School registration',
    requestDate: '2024-01-28',
    status: 'in-review',
    approvals: {
      level1: { approvedBy: 'Sarah Johnson', date: '2024-01-29', comments: 'Documents verified' },
      level2: { approvedBy: 'Rev. Michael Brown', date: '2024-01-30', comments: 'Approved for final review' }
    }
  },
  {
    id: 'cert-5',
    memberId: '5',
    memberName: 'David Wilson',
    certificateType: 'marriage',
    purpose: 'Legal documentation',
    requestDate: '2024-01-30',
    status: 'in-review',
    approvals: {
      level1: { approvedBy: 'Sarah Johnson', date: '2024-01-31', comments: 'Initial review complete' }
    }
  },
  {
    id: 'cert-6',
    memberId: '6',
    memberName: 'Lisa Anderson',
    certificateType: 'recommendation',
    purpose: 'Employment verification',
    requestDate: '2024-02-01',
    status: 'pending',
    approvals: {}
  },
  {
    id: 'cert-7',
    memberId: '7',
    memberName: 'Robert Taylor',
    certificateType: 'baptism',
    purpose: 'School enrollment',
    requestDate: '2024-02-02',
    status: 'in-review',
    approvals: {
      level1: { approvedBy: 'Sarah Johnson', date: '2024-02-03', comments: 'Documents verified' }
    }
  },
  {
    id: 'cert-8',
    memberId: '8',
    memberName: 'Jennifer White',
    certificateType: 'membership',
    purpose: 'Transfer to another parish',
    requestDate: '2024-02-03',
    status: 'in-review',
    approvals: {
      level1: { approvedBy: 'Sarah Johnson', date: '2024-02-04', comments: 'Initial review complete' },
      level2: { approvedBy: 'Rev. Michael Brown', date: '2024-02-05', comments: 'Approved for final review' }
    }
  }
];

export const getUserPermissions = (role: UserRole) => {
  switch (role) {
    case 'member':
      return {
        canViewOwnProfile: true,
        canEditOwnProfile: true,
        canRequestCertificate: true,
        canViewOwnRequests: true,
      };
    case 'zone-leader':
      return {
        canViewOwnProfile: true,
        canEditOwnProfile: true,
        canRequestCertificate: true,
        canViewOwnRequests: true,
        canViewZoneMembers: true,
        canEditZoneMembers: true,
        canDeleteZoneMembers: true,
        canApproveLevel1: true,
        canRequestOnBehalf: true,
      };
    case 'pastor':
      return {
        canViewOwnProfile: true,
        canEditOwnProfile: true,
        canRequestCertificate: true,
        canViewOwnRequests: true,
        canViewAllMembers: true,
        canEditAllMembers: true,
        canDeleteAllMembers: true,
        canManageZones: true,
        canAssignZoneLeaders: true,
        canApproveLevel2: true,
        canViewStats: true,
      };
    case 'parish-pastor':
      return {
        canViewOwnProfile: true,
        canEditOwnProfile: true,
        canViewAllMembers: true,
        canEditAllMembers: true,
        canDeleteAllMembers: true,
        canManageZones: true,
        canAssignZoneLeaders: true,
        canManagePastors: true,
        canApproveLevel3: true,
        canViewGlobalStats: true,
      };
    default:
      return {};
  }
};