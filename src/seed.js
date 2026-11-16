'use strict';

const APP_VERSION = 1;
const STORAGE_KEY = 'forma.bodylab.v1';
const METRIC_GROUPS = [
  { title: 'Složení těla', metrics: [
    ['weight','Hmotnost','kg'],['fatKg','Tělesný tuk','kg'],['pbf','Tělesný tuk (PBF)','%'],
    ['ffm','Beztuková hmota (FFM)','kg'],['slm','Měkká beztuková hmota (SLM)','kg'],
    ['smm','Kosterní svaly (SMM)','kg'],['bmi','BMI',''],['score','InBody skóre','/100']
  ]},
  { title: 'Voda a tkáně', metrics: [
    ['tbw','Celková tělesná voda (TBW)','l'],['icw','Intracelulární voda (ICW)','l'],
    ['ecw','Extracelulární voda (ECW)','l'],['ecwTbw','ECW/TBW',''],['ecfTbf','ECF/TBF',''],
    ['bcm','Buněčná hmota (BCM)','kg'],['protein','Bílkoviny v těle','kg'],
    ['minerals','Minerály','kg'],['bmc','Kostní minerály (BMC)','kg'],['amc','AMC','']
  ]},
  { title: 'Metabolismus a další', metrics: [
    ['whr','Pas/boky (WHR)',''],['vfa','Viscerální tuková plocha (VFA)','cm²'],
    ['visceral','Úroveň viscerálního tuku',''],['absi','ABSI',''],['obesity','Stupeň obezity','%'],
    ['bmr','Bazální metabolismus','kcal'],['bma','BMA',''],['smi','SMI','kg/m²'],
    ['phase','Fázový úhel','°'],['intake','InBody doporučený příjem','kcal']
  ]}
];
const SEGMENTS = [
  ['leftArm','Levá ruka'],['rightArm','Pravá ruka'],['trunk','Trup'],
  ['leftLeg','Levá noha'],['rightLeg','Pravá noha']
];
const EMPTY_SEG = () => ({leftArm:null,rightArm:null,trunk:null,leftLeg:null,rightLeg:null});
// Tento repozitář neobsahuje žádná osobní měření.
// Historická data importujte přes Data a zálohy ze soukromého JSON souboru.
const originalWeights = [];
const INITIAL_INBODY = [];
const INITIAL_GOALS = [];
const INITIAL_NUTRITION = [];
const INITIAL_EVENTS = [];
const makeInitialData = () => ({
  version: APP_VERSION,
  weights: structuredClone(originalWeights),
  inbodies: structuredClone(INITIAL_INBODY),
  goals: structuredClone(INITIAL_GOALS),
  nutrition: structuredClone(INITIAL_NUTRITION),
  events: structuredClone(INITIAL_EVENTS),
  settings: {kcal:3000,protein:140,carbs:385,fat:100,goalGain:0.2,accent:'lime'},
  createdAt:new Date().toISOString().slice(0,10),modifiedAt:new Date().toISOString()
});
