import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';

import Modal from './Components/Modal';
import AddContact from './Components/AddContact';

import styles from './styles/Home.module.css';
import 'react-toastify/dist/ReactToastify.css';

const App = ({ socket })=>{
  //authentication modal 
  const [modal, setModal] = useState({ open: false, type: false });
  const openModal = type => setModal({ open: true, type: type });

  //contact modal
  const [contactModal, setContactModal] = useState({ open: false });
  const openContactModal = ()=> setContactModal({ open: true });

  const [keypair, setKeypair] = useState(null);
  const [chat, setChat] = useState({
    /*'username': {
      publicKey: '',
      messages: [
        {
          from: '',
          message: '',
          timestamp: ''
        }
      ],
    }
    */
  });
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(()=>{
    if(keypair && typeof keypair === 'object'){
      socket.emit('authenticate', { publicKey: keypair.publicKey }, (err, success)=>{
        if(err){
          if(err === 1) toast.error('Someone is already authenticated with this public key. Please close any other sessions and try again.');
          return setKeypair(null);
        }
        toast.success('Successfully authenticated to websocket server.');
      });
    }
  }, [keypair]);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Anonymous Live Chat
        </h1>

        {
          keypair ? (
            <div className={styles.chat}>
              <div className={styles.chatContainer}>
                <div className={styles.chatSidebar}>
                  <div className={styles.sidebarHeader}>
                    <h3>Contacts</h3>
                    <button onClick={openContactModal}>+</button>
                  </div>
                  <div className={styles.sidebarContacts}>
                    {
                      Object.keys(chat).length > 0 ? (
                        Object.keys(chat).map((key, index) => (
                          <div className={styles.sidebarContact} key={index} onClick={setSelectedChat(key)}>
                            <span></span>
                          </div>
                        ))
                      ) : (
                        <p>Please add a contact</p>
                      )
                    }
                  </div>
                </div>

                <div className={styles.chatBody}>
                  <div className={styles.chatHeader}>
                    <h3>{selectedChat ? selectedChat : 'Select a contact'}</h3>
                  </div>
                  <div className={styles.messageContainer}>
                    {
                      selectedChat ? (
                        chat[selectedChat]?.messages?.map((message, index) => (
                          <div className={styles.chatMessage} key={index}>
                          </div>
                        ))
                      ) : (
                        <div className={styles.chatWelcome}>
                          <h3>Please select a contact to chat with.</h3>
                        </div>
                      )
                    }
                  </div>
                  <div className={styles.chatFooter}>

                  </div>
                </div>
              </div>
            </div>
          ) : (
          <div className={styles.grid}>
            <div className={styles.card} onClick={()=>openModal(true)}>
              <h2>Generate New Keypair &rarr;</h2>
            </div>

            <div className={styles.card} onClick={()=>openModal()}>
              <h2>Load Existing Keypair &rarr;</h2>
            </div>

          </div>
          )
        }
      </main>

      <Modal open={modal.open} setOpen={setModal} generateNew={modal.type} setParentKeys={setKeypair} toast={toast}/>
      <AddContact open={contactModal.open} setOpen={setContactModal} publicKey={keypair?.publicKey} socket={socket} toast={toast} setChat={setChat}/>

      <ToastContainer
        position="bottom-right"
        theme="dark"
        autoClose={3000}
      />
    </div>
  )
}

export default App;
