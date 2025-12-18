//data/equipmentData.ts
//udah ga kepake udah make database

export interface Equipment {
  id : string;
  name: string;
  description: string;
  available: number;
  image:any;
}

export const equipmentData: Equipment[]=[
  {
    id:'1',
    name:'Digital Microscop',
    description:'High-resolution digital microscope for biological samples',
    available: 5,
    image: require('../assets/images/microscope.png')
  },
   {
    id: '2',
    name: 'Centrifuge',
    description: 'A device used to separate components of a fluid',
    available: 3,
    image: require('../assets/images/centrifuge.png'), 
  },
   {
    id: '3',
    name: 'Bunsen Burner',
    description: 'Produces a single open gas flame for heating',
    available: 12,
    image: require('../assets/images/burner.png'), // Ganti dengan path gambar Anda
  },
   {
    id: '4',
    name: 'Bunsen Burner',
    description: 'Produces a single open gas flame for heating',
    available: 12,
    image: require('../assets/images/burner.png'), // Ganti dengan path gambar Anda
  },
  {
    id: '5',
    name: 'Bunsen Burner',
    description: 'Produces a single open gas flame for heating',
    available: 12,
    image: require('../assets/images/burner.png'), // Ganti dengan path gambar Anda
  },
  {
    id: '6',
    name: 'Bunsen Burner',
    description: 'Produces a single open gas flame for heating',
    available: 12,
    image: require('../assets/images/burner.png'), // Ganti dengan path gambar Anda
  },{
    id: '7',
    name: 'Bunsen Burner',
    description: 'Produces a single open gas flame for heating',
    available: 12,
    image: require('../assets/images/burner.png'), // Ganti dengan path gambar Anda
  },
  {
    id: '8',
    name: 'Bunsen Burner',
    description: 'Produces a single open gas flame for heating',
    available: 12,
    image: require('../assets/images/burner.png'), // Ganti dengan path gambar Anda
  },
  
];