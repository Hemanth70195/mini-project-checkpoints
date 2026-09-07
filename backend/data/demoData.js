/**
 * demoData.js
 * 
 * Realistic Logistics Benchmark Data for Multi-Truck Delivery Optimization.
 * Includes central depots, multi-category truck fleets, and realistic delivery orders
 * with weight (kg), volume (m³), package categories, and coordinates.
 */

export const DEMO_SCENARIOS = {
  BANGALORE_HUB: {
    name: 'Bengaluru Logistics Corridor (Tech Hub & Industrial Zones)',
    depot: {
      id: 'DEPOT_BLR_01',
      name: 'Amazon / Flipkart Central Fulfillment Center (Yeshwanthpur)',
      lat: 13.0280,
      lng: 77.5409,
      type: 'depot'
    },
    trucks: [
      {
        id: 'TRUCK_MINI_01',
        name: 'Express Courier Van (KA-01-EA-1021)',
        type: 'mini',
        maxWeightKg: 1000,
        maxVolumeM3: 6.0,
        baseMileageKmPerLitre: 14.0,
        fuelCapacityLitres: 50,
        currentFuelLitres: 45,
        driver: 'Ramesh Kumar',
        phone: '+91 98450 11223'
      },
      {
        id: 'TRUCK_MINI_02',
        name: 'City-Sprint Delivery (KA-01-EA-1044)',
        type: 'mini',
        maxWeightKg: 1000,
        maxVolumeM3: 6.0,
        baseMileageKmPerLitre: 14.0,
        fuelCapacityLitres: 50,
        currentFuelLitres: 38,
        driver: 'Sunil Rao',
        phone: '+91 98450 22334'
      },
      {
        id: 'TRUCK_MED_01',
        name: 'Titan Medium Duty Box Truck (KA-04-MD-5520)',
        type: 'medium',
        maxWeightKg: 3500,
        maxVolumeM3: 18.0,
        baseMileageKmPerLitre: 8.5,
        fuelCapacityLitres: 120,
        currentFuelLitres: 95,
        driver: 'Mohammed Arif',
        phone: '+91 98450 33445'
      },
      {
        id: 'TRUCK_LRG_01',
        name: 'BharatBenz Heavy Container (KA-51-HD-9901)',
        type: 'large',
        maxWeightKg: 12000,
        maxVolumeM3: 50.0,
        baseMileageKmPerLitre: 4.5,
        fuelCapacityLitres: 300,
        currentFuelLitres: 240,
        driver: 'Vikram Singh',
        phone: '+91 98450 44556'
      }
    ],
    orders: [
      {
        id: 'ORD_001',
        customer: 'Infosys Campus DC-12',
        address: 'Electronics City Phase 1, Bengaluru',
        lat: 12.8452,
        lng: 77.6602,
        weightKg: 45,
        volumeM3: 0.35,
        packageType: 'electronics',
        priority: 2,
        description: 'Server Rack Components & Cisco Switches'
      },
      {
        id: 'ORD_002',
        customer: 'Wipro Technologies Gate 3',
        address: 'Sarjapur Main Road, Doddakannelli',
        lat: 12.9117,
        lng: 77.6874,
        weightKg: 25,
        volumeM3: 0.20,
        packageType: 'electronics',
        priority: 1,
        description: 'Employee Laptops & Peripheral Kits'
      },
      {
        id: 'ORD_003',
        customer: 'IKEA Customer Fulfillment Hub',
        address: 'Nagasandra, Tumkur Road',
        lat: 13.0489,
        lng: 77.4988,
        weightKg: 420,
        volumeM3: 4.50,
        packageType: 'furniture',
        priority: 2,
        description: 'Flatpack Dining Tables and Wardrobes'
      },
      {
        id: 'ORD_004',
        customer: 'Kirloskar Electric Co.',
        address: 'Peenya Industrial Area Phase 2',
        lat: 13.0315,
        lng: 77.5142,
        weightKg: 4200,
        volumeM3: 14.00,
        packageType: 'heavy_machinery',
        priority: 3,
        description: 'Industrial 3-Phase Induction Motors'
      },
      {
        id: 'ORD_005',
        customer: 'Croma Megastore',
        address: '100ft Road, Indiranagar',
        lat: 12.9784,
        lng: 77.6408,
        weightKg: 180,
        volumeM3: 1.80,
        packageType: 'appliances',
        priority: 1,
        description: 'Smart OLED TVs & Washing Machines'
      },
      {
        id: 'ORD_006',
        customer: 'Bosch Engineering Center',
        address: 'Hosur Road, Adugodi',
        lat: 12.9416,
        lng: 77.6101,
        weightKg: 85,
        volumeM3: 0.60,
        packageType: 'electronics',
        priority: 2,
        description: 'Automotive ECU Sensors & Diagnostic Tools'
      },
      {
        id: 'ORD_007',
        customer: 'FabIndia Flagship Store',
        address: 'Jayanagar 4th Block',
        lat: 12.9299,
        lng: 77.5833,
        weightKg: 60,
        volumeM3: 0.80,
        packageType: 'apparel',
        priority: 1,
        description: 'Textile Rolls & Retail Apparel'
      },
      {
        id: 'ORD_008',
        customer: 'Urban Ladder Warehouse',
        address: 'HSR Layout Sector 2',
        lat: 12.9121,
        lng: 77.6446,
        weightKg: 310,
        volumeM3: 3.20,
        packageType: 'furniture',
        priority: 2,
        description: 'Ergonomic Office Chairs and Standing Desks'
      },
      {
        id: 'ORD_009',
        customer: 'Prestige Tech Park Hub',
        address: 'Marathahalli - Sarjapur Outer Ring Rd',
        lat: 12.9372,
        lng: 77.6914,
        weightKg: 30,
        volumeM3: 0.15,
        packageType: 'small_parcel',
        priority: 1,
        description: 'Document Pouches & Security Keycards'
      },
      {
        id: 'ORD_010',
        customer: 'HAL Aerospace Manufacturing Div.',
        address: 'Old Airport Road, Vimanapura',
        lat: 12.9562,
        lng: 77.6681,
        weightKg: 2800,
        volumeM3: 11.50,
        packageType: 'heavy_machinery',
        priority: 3,
        description: 'Precision Titanium Rotor Castings'
      },
      {
        id: 'ORD_011',
        customer: 'Columbia Asia / Manipal Hospital',
        address: 'Hebbal Flyover Junction',
        lat: 13.0359,
        lng: 77.5889,
        weightKg: 40,
        volumeM3: 0.40,
        packageType: 'electronics',
        priority: 3,
        description: 'Critical Dialysis Diagnostic Cartridges'
      },
      {
        id: 'ORD_012',
        customer: 'Manyata Tech Park Embassy Office',
        address: 'Nagavara, Outer Ring Road',
        lat: 13.0483,
        lng: 77.6206,
        weightKg: 70,
        volumeM3: 0.50,
        packageType: 'small_parcel',
        priority: 2,
        description: 'Corporate Network Routers & Telecom Gear'
      },
      {
        id: 'ORD_013',
        customer: 'Godrej Interio Showroom',
        address: 'Koramangala 80ft Road',
        lat: 12.9352,
        lng: 77.6245,
        weightKg: 260,
        volumeM3: 2.80,
        packageType: 'furniture',
        priority: 2,
        description: 'Modular Conference Tables'
      },
      {
        id: 'ORD_014',
        customer: 'Apollo Pharmacy Central Depot',
        address: 'Rajajinagar 1st Block',
        lat: 12.9881,
        lng: 77.5548,
        weightKg: 35,
        volumeM3: 0.25,
        packageType: 'small_parcel',
        priority: 3,
        description: 'Temperature-Controlled Medicine Vaccines'
      },
      {
        id: 'ORD_015',
        customer: 'ABB Robotics Automation Facility',
        address: 'Nelamangala Highway Junction',
        lat: 13.0988,
        lng: 77.3912,
        weightKg: 3600,
        volumeM3: 12.00,
        packageType: 'heavy_machinery',
        priority: 3,
        description: '6-Axis Articulated Industrial Robotic Arm'
      }
    ]
  }
};

export default DEMO_SCENARIOS;
