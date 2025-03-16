
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/Convite.module.css';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "FIRE_BASE_APP",
  projectId: "PROJECT_NAME",
  storageBucket: "STORAGE_BUCKET",
  messagingSenderId: "MESSAGE_ID",
  appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface HeartProps {
  position: {
    x: string;
    y: string;
  };
}

const Heart: React.FC<HeartProps> = ({ position }) => {
  return (
    <div 
      className={styles.heart} 
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
  const router = useRouter();
  const [hearts, setHearts] = useState<HeartProps[]>([]);
  const [message, setMessage] = useState<string>('');
  const [showNameForm, setShowNameForm] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [noButtonStyle, setNoButtonStyle] = useState({});
  const { id: inviteId } = router.query;

  // Criar corações
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

    // Remover corações após animação
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

  // Salvar resposta no Firebase
  const saveResponse = async (answer: string, respondentName: string) => {
    try {
      const docId = inviteId?.toString() || Date.now().toString();
      await setDoc(doc(db, "convites", docId), {
        resposta: answer,
        nome: respondentName,
        data: new Date().toISOString()
      });
      console.log("Resposta salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar resposta:", error);
    }
  };

  // Quando clicar em Sim
  const handleYesClick = () => {
    createHearts();
    setMessage("Que maravilha! Mal posso esperar!");
    setShowNameForm(true);
  };

  // Quando clicar em Não (caso consiga)
  const handleNoClick = () => {
    saveResponse("Não", "Pessoa Misteriosa");
    setMessage("Botão impossível de clicar... mas você conseguiu! Impressionante!");
  };

  // Quando enviar o nome
  const handleSubmitName = () => {
    if (name.trim()) {
      saveResponse("Sim", name);
      setMessage(`Obrigado, ${name}! Sua resposta foi registrada!`);
      setShowNameForm(false);
    } else {
      setMessage("Por favor, digite seu nome!");
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Convite Romântico</title>
        <meta name="description" content="Um convite especial para você" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className={styles.title}>Você quer sair comigo?</h1>
      
      <div className={styles.buttons}>
        <button 
          className={styles.button} 
          onClick={handleYesClick}
        >
          Sim
        </button>
        <button 
          className={styles.button} 
          style={noButtonStyle} 
          onMouseOver={moveButton}
          onClick={handleNoClick}
        >
          Não
        </button>
      </div>

      {message && <div className={styles.message}>{message}</div>}
      
      {showNameForm && (
        <div className={styles.formContainer}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite seu nome"
            className={styles.input}
          />
          <button 
            onClick={handleSubmitName}
            className={styles.button}
          >
            Enviar
          </button>
        </div>
      )}

      {hearts.map((heart, index) => (
        <Heart key={index} position={heart.position} />
      ))}
    </div>
  );
}