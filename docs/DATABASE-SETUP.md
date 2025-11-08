# College Recommendation Database Setup

## 📊 Firestore Collections Required

### Collection: `colleges`

This collection stores all college information needed for recommendations.

#### Document Structure

```typescript
{
  id: string;                    // Auto-generated or custom ID
  name: string;                  // "National Institute of Technology, Karnataka"
  location: string;              // "Surathkal, Karnataka"
  city: string;                  // "Surathkal"
  state: string;                 // "Karnataka"
  type: "Government" | "Private" | "Autonomous" | "Deemed";
  affiliation: string;           // "NITK" or "VTU" or "Deemed University"
  established: number;           // 1960
  courses: string[];             // ["B.Tech", "M.Tech", "PhD"]
  
  // Cutoffs by exam type and branch
  cutoffs: {
    JEE: {
      "Computer Science": 5000,
      "Information Technology": 7000,
      "Electronics & Communication": 8000,
      "Mechanical": 10000
    },
    KCET: {
      "Computer Science": 500,
      "Information Technology": 800
    }
  };
  
  nirf_rank: number | null;      // 10 (or null if unranked)
  autonomous: boolean;           // true or false
  
  placement_stats: {
    highest_package: number;     // 4500000 (in rupees)
    average_package: number;     // 1200000
    median_package: number;      // 900000
    placement_percentage: number;// 95 (0-100)
    top_recruiters: string[];    // ["Google", "Microsoft", "Amazon"]
    year: number;                // 2024
  } | null;
  
  facilities: string[];          // ["Library", "Gym", "Hostel", "Labs", "WiFi"]
  website: string | null;        // "https://nitk.ac.in"
  logo_url: string | null;       // "https://..."
}
```

#### Sample Document

```json
{
  "id": "nitk-surathkal",
  "name": "National Institute of Technology Karnataka",
  "location": "Surathkal, Karnataka",
  "city": "Surathkal",
  "state": "Karnataka",
  "type": "Government",
  "affiliation": "NITK",
  "established": 1960,
  "courses": ["B.Tech", "M.Tech", "PhD"],
  "cutoffs": {
    "JEE": {
      "Computer Science": 5000,
      "Information Technology": 7000,
      "Electronics & Communication": 8000,
      "Mechanical": 10000,
      "Civil": 12000,
      "Electrical": 9000
    },
    "KCET": {
      "Computer Science": 500,
      "Information Technology": 800,
      "Electronics & Communication": 1000
    }
  },
  "nirf_rank": 13,
  "autonomous": true,
  "placement_stats": {
    "highest_package": 4500000,
    "average_package": 1200000,
    "median_package": 900000,
    "placement_percentage": 95,
    "top_recruiters": [
      "Google",
      "Microsoft",
      "Amazon",
      "Adobe",
      "Goldman Sachs",
      "Qualcomm",
      "Intel",
      "Samsung",
      "Flipkart",
      "Oracle"
    ],
    "year": 2024
  },
  "facilities": [
    "Central Library",
    "Sports Complex",
    "Hostels",
    "Advanced Labs",
    "WiFi Campus",
    "Medical Center",
    "Cafeteria",
    "Innovation Center"
  ],
  "website": "https://www.nitk.ac.in",
  "logo_url": null
}
```

## 🔧 Database Setup Methods

### Method 1: Firebase Console (Manual)

1. Go to Firebase Console
2. Select your project
3. Navigate to Firestore Database
4. Click "Start Collection"
5. Collection ID: `colleges`
6. Add documents manually using the structure above

### Method 2: Bulk Import (Recommended)

Create a script to import multiple colleges at once:

```typescript
// scripts/import-colleges.ts
import { getFirestore, collection, setDoc, doc } from 'firebase/firestore';
import { getApp } from 'firebase/app';

const colleges = [
  {
    id: "nitk-surathkal",
    name: "NIT Karnataka",
    // ... rest of data
  },
  {
    id: "rvce-bangalore",
    name: "RV College of Engineering",
    // ... rest of data
  }
  // Add more colleges
];

async function importColleges() {
  const db = getFirestore(getApp());
  const collegesRef = collection(db, 'colleges');
  
  for (const college of colleges) {
    await setDoc(doc(collegesRef, college.id), college);
    console.log(`Imported: ${college.name}`);
  }
  
  console.log('Import complete!');
}

importColleges();
```

### Method 3: Admin SDK (Batch Import)

```typescript
import * as admin from 'firebase-admin';
import collegesData from './colleges.json';

admin.initializeApp();
const db = admin.firestore();

async function batchImport() {
  const batch = db.batch();
  
  collegesData.forEach((college: any) => {
    const ref = db.collection('colleges').doc(college.id);
    batch.set(ref, college);
  });
  
  await batch.commit();
  console.log('Batch import complete!');
}
```

## 📝 Sample Colleges to Start

### Top Engineering Colleges

```json
[
  {
    "id": "iit-bombay",
    "name": "Indian Institute of Technology Bombay",
    "city": "Mumbai",
    "state": "Maharashtra",
    "type": "Government",
    "cutoffs": {
      "JEE": {
        "Computer Science": 100,
        "Electrical": 500,
        "Mechanical": 800
      }
    },
    "nirf_rank": 3,
    "placement_stats": {
      "highest_package": 15000000,
      "average_package": 2100000,
      "placement_percentage": 98
    }
  },
  {
    "id": "rvce-bangalore",
    "name": "RV College of Engineering",
    "city": "Bangalore",
    "state": "Karnataka",
    "type": "Autonomous",
    "cutoffs": {
      "KCET": {
        "Computer Science": 1000,
        "Information Technology": 1500
      },
      "COMEDK": {
        "Computer Science": 500,
        "Information Technology": 800
      }
    },
    "nirf_rank": 85,
    "placement_stats": {
      "highest_package": 4200000,
      "average_package": 800000,
      "placement_percentage": 90
    }
  }
]
```

## 🔍 Indexes Required

Create these composite indexes for better query performance:

### Index 1: Cutoff Queries
```
Collection: colleges
Fields: 
  - exam_type (Ascending)
  - cutoffs.<exam>.<branch> (Ascending)
  - nirf_rank (Ascending)
```

### Index 2: Location Queries
```
Collection: colleges
Fields:
  - city (Ascending)
  - type (Ascending)
  - nirf_rank (Ascending)
```

Firestore will automatically prompt you to create indexes when queries fail.

## 📊 Data Sources for Collection

### Where to Get College Data:

1. **NIRF Rankings**: https://www.nirfindia.org/
   - Official rankings
   - Basic information
   - Placement data

2. **College Websites**: 
   - Cutoff data
   - Facilities list
   - Placement statistics

3. **Admission Portals**:
   - JoSAA (JEE): https://josaa.nic.in/
   - KEA (KCET): https://kea.kar.nic.in/
   - COMEDK: https://www.comedk.org/

4. **Wikipedia**: Basic information, history

5. **Reddit**: Student feedback (automated via our service)

## 🔄 Keeping Data Updated

### Regular Updates Needed:

1. **Annual** (Before Admissions):
   - Cutoff data from previous year
   - Placement statistics
   - NIRF rankings

2. **Quarterly**:
   - New facilities
   - Affiliation changes
   - Website URLs

3. **As Needed**:
   - College name changes
   - New courses
   - Location updates

### Update Script Example

```typescript
// Update placement stats for a college
await updateDoc(doc(db, 'colleges', 'nitk-surathkal'), {
  'placement_stats.year': 2024,
  'placement_stats.highest_package': 5000000,
  'placement_stats.average_package': 1300000
});
```

## 🎯 Minimum Viable Dataset

To test the feature, you need at least:
- ✅ 10-20 colleges
- ✅ Cutoffs for your target exam (JEE/KCET)
- ✅ Basic placement stats
- ✅ Location information

## 🚀 Quick Setup Script

Save this as `scripts/setup-colleges-db.ts`:

```typescript
import { getApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const minimalColleges = [
  {
    name: "NIT Karnataka",
    location: "Surathkal, Karnataka",
    city: "Surathkal",
    state: "Karnataka",
    type: "Government",
    affiliation: "NITK",
    established: 1960,
    courses: ["B.Tech", "M.Tech"],
    cutoffs: {
      JEE: { "Computer Science": 5000, "Mechanical": 10000 }
    },
    nirf_rank: 13,
    autonomous: true,
    placement_stats: {
      highest_package: 4500000,
      average_package: 1200000,
      median_package: 900000,
      placement_percentage: 95,
      top_recruiters: ["Google", "Microsoft", "Amazon"],
      year: 2024
    },
    facilities: ["Library", "Gym", "Hostel", "Labs"],
    website: "https://nitk.ac.in",
    logo_url: null
  }
  // Add 9 more similar colleges
];

async function setupDatabase() {
  const db = getFirestore(getApp());
  const collegesRef = collection(db, 'colleges');
  
  for (const college of minimalColleges) {
    const docRef = await addDoc(collegesRef, college);
    console.log(`Added college: ${college.name} with ID: ${docRef.id}`);
  }
}

setupDatabase().then(() => {
  console.log('Database setup complete!');
}).catch((error) => {
  console.error('Setup failed:', error);
});
```

Run with: `ts-node scripts/setup-colleges-db.ts`

## ✅ Verification

After setup, verify by:

1. Check Firestore Console - see documents
2. Run test query in code
3. Try the recommendation feature
4. Check if cutoffs are being matched correctly

## 📞 Support

If you encounter issues:
- Ensure Firebase is initialized
- Check Firestore rules allow read/write
- Verify document structure matches schema
- Test with console queries first

---

**Ready to start? Follow Method 2 (Bulk Import) for fastest setup!**
