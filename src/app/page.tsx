"use client"

import { initializeApp } from 'firebase/app';
import { Firestore, collection, doc, getFirestore, setDoc } from 'firebase/firestore';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import dynamic from "next/dynamic";

interface ResponseData {
  resposta: string;
  data: string;
  dataEscolhida?: string;
  horaEscolhida?: string;
  location?: {
    lat: number;
    lng: number;
  }
}

interface HeartProps {
  position: {
    x: string;
    y: string;
  };
}

const Heart: React.FC<HeartProps> = ({ position }) => {
  return (
    <div
      className="absolute text-2xl animate-bounce"
      style={{
        left: position.x,
        top: position.y
      }}
    >
      ❤️
    </div>
  );
};

export default function Convite() {

  const DynamicMap = dynamic(() => import("@/components/Map"), { ssr: false });
  // Estado para o Firestore
  const [db, setDb] = useState<Firestore | null>(null);

  useEffect(() => {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIRE_BASE_APP,
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_MESSAGE_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_APP_ID
    };
    console.log("Firebase Config:", firebaseConfig);

    try {
      const firebaseApp = initializeApp(firebaseConfig);
      console.log("Firebase App initialized:", firebaseApp);
      setDb(getFirestore(firebaseApp));
    } catch (error) {
      console.error("Erro ao inicializar o Firebase:", error);
    }
  }, []);


  const [hearts, setHearts] = useState<HeartProps[]>([]);
  const [message, setMessage] = useState<string>('');
  const [noButtonStyle, setNoButtonStyle] = useState({});

  // Estados para data, hora e localização
  const [showDateTimePicker, setShowDateTimePicker] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number, lng: number } | null>(null);

  // Opções de horário
  const timeOptions = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00'
  ];

  // Função para criar os corações
  const createHearts = () => {
    const newHearts = [];
    for (let i = 0; i < 30; i++) {
      newHearts.push({
        position: {
          x: `${Math.random() * 90}vw`,
          y: `${Math.random() * 80}vh`
        }
      });
    }
    setHearts(newHearts);

    // Remove os corações após a animação
    setTimeout(() => {
      setHearts([]);
    }, 2000);
  };

  // Mover o botão "Não"
  const moveButton = () => {
    setNoButtonStyle({
      position: 'absolute',
      left: `${Math.random() * (typeof window !== 'undefined' ? window.innerWidth - 100 : 500)}px`,
      top: `${Math.random() * (typeof window !== 'undefined' ? window.innerHeight - 50 : 500)}px`,
    });
  };

  // Salvar resposta no Firestore
  const saveResponse = async (answer: string, date?: string, time?: string) => {
    if (!db) {
      console.warn("Firestore ainda não está inicializado.");
      return;
    }

    try {
      const responseData: ResponseData = {
        resposta: answer,
        data: new Date().toISOString()
      };

      if (date) responseData.dataEscolhida = date;
      if (time) responseData.horaEscolhida = time;
      if (selectedCoordinates) responseData.location = selectedCoordinates;

      console.log("Enviando dados para Firestore:", responseData);

      const docRef = doc(collection(db, "convites"));
      await setDoc(docRef, responseData);
      console.log("Resposta salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar resposta:", error);
    }
  };

  // Eventos dos botões
  const handleYesClick = () => {
    console.log("Yes button clicked!");
    createHearts();
    setMessage("Que maravilha! Escolha uma data, hora e local que funcionem para você!");
    setShowDateTimePicker(true);
  };

  const handleNoClick = () => {
    saveResponse("Não");
    setMessage("Botão impossível de clicar... mas você conseguiu! Impressionante!");
  };

  const handleSubmitDateTime = () => {
    if (selectedDate && selectedTime && selectedCoordinates) {
      saveResponse("Sim", selectedDate, selectedTime);
      setMessage(`Obrigado! Seu encontro está marcado para ${selectedDate} às ${selectedTime}.`);
      setShowDateTimePicker(false);
    } else {
      setMessage("Por favor, selecione uma data, horário e local!");
    }
  };

  // Funções para obter data mínima e máxima
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const year = maxDate.getFullYear();
    const month = String(maxDate.getMonth() + 1).padStart(2, '0');
    const day = String(maxDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 flex flex-col items-center justify-center p-4 relative">
      <Head>
        <title>Convite Romântico</title>
        <meta name="description" content="Um convite especial para você" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-4xl md:text-5xl font-bold text-pink-600 mb-10 text-center">Você quer sair comigo?</h1>

      <div className="flex space-x-6 mb-8">
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105"
          onClick={handleYesClick}
        >
          Sim
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105"
          style={noButtonStyle}
          onMouseOver={moveButton}
          onClick={handleNoClick}
        >
          Não
        </button>
      </div>

      {message && (
        <div className="bg-white bg-opacity-70 p-4 rounded-lg shadow-md text-center text-lg font-medium text-gray-800 mb-6 max-w-md">
          {message}
        </div>
      )}

      {showDateTimePicker && (
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
          <div className="space-y-4 mb-6">
            {/* Campo de data */}
            <div className="flex flex-col">
              <label htmlFor="date" className="mb-2 font-medium text-gray-700">Escolha uma data:</label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getTodayDate()}
                max={getMaxDate()}
                className="bg-gray-600 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Campo de horário */}
            <div className="flex flex-col">
              <label htmlFor="time" className="mb-2 font-medium text-gray-700">Escolha um horário:</label>
              <select
                id="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="bg-gray-600 border border-gray-300 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Selecione um horário</option>
                {timeOptions.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
<span>Quero saber uma Região que te agrada assim não perco tempo olhando algo do outro lado da cidade </span>
            <div className="flex flex-col">
              <label className="mb-2 font-medium text-gray-700">Selecione o local:</label>
              <DynamicMap onLocationSelect={(coords) => {
                console.log("Coordinates selected:", coords);
                setSelectedCoordinates(coords);
              }} />
            </div>
          </div>
<span>Parece que não acontece nada, mas a localização está sendo salva. Minha 1 hora acabou antes de fazer bonito 😟</span>
          <button
            onClick={handleSubmitDateTime}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
          >
            Confirmar
          </button>
        </div>
      )}

      {hearts.map((heart, index) => (
        <Heart key={index} position={heart.position} />
      ))}
    </div>
  );
}
