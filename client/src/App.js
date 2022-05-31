import { useEffect, useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useDispatch, connect } from 'react-redux';

import { setModal, setContactModal, sendMessage as setMessageState, receivedMessage, txtChatExport, dataImport } from './store/actions';

import Modal from './Components/Modal';
import AddContact from './Components/AddContact';
import ChatMessage from './Components/ChatMessage';

import styles from './styles/Home.module.css';
import 'react-toastify/dist/ReactToastify.css';

import DownloadSolid from './assets/download-solid.svg';
import ImportSolid from './assets/import-solid.svg';

const App = ({ socket, modal, contactModal, keypair, chat })=>{
  const dispatch = useDispatch();

  //authentication modal 
  const openModal = type => dispatch(setModal({ open: true, type: type }));
  //add contact modal
  const openAddContactModal = ()=> dispatch(setContactModal({ open: true }));
  //contact modal
  const openContactModal = (username, publicKey)=> dispatch(setContactModal({ open: true, edit: true, oldDetails: { username, publicKey} }));

  const [showChat, setShowChat] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const chatMessageInput = useRef();
  const chatMessageBottom = useRef();

  const sendMessage = async ()=>{
    await dispatch(setMessageState({ username: selectedChat, message: chatMessage }));

    setChatMessage('');
  };

  //listen for enter event to send message
  useEffect(()=>{
    //when socket receives a new message
    socket.on('connect', ()=>{
      toast.success('Connected to server.');
    });
    socket.on('message', (message)=>{
      dispatch(receivedMessage(message));
      chatMessageBottom.current.scrollIntoView({ behavior: 'smooth' });
    });

    window.onbeforeunload = () => "Are you sure you want to reload? All your messages will be lost.";

    window.onload = () => chatMessageBottom.current.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(()=>{
    if(keypair && keypair.publicKey){
      setShowChat(true);
    }
  }, [keypair]);

  const exportChat = ()=>{
    dispatch(txtChatExport(selectedChat));
  };

  const exportData = ()=>{
    let dataToExport = JSON.stringify(chat);

    const element = document.createElement("a");

    const file = new Blob([dataToExport], {type: 'text/json'});
    element.href = URL.createObjectURL(file);

    element.download = `CHAT_EXPORT_${Date.now()}.json`;
    document.body.appendChild(element);

    element.click();
  };

  const importData = (e)=>{
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");

    fileReader.onload = e => {
      console.log("e.target.result", e.target.result);
      dispatch(dataImport(e.target.result));
    };
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {
          showChat ? (
            <>
            <div className={styles.settingsContainer}>
              <label htmlFor="file-upload">
                <img src={ImportSolid} alt="Import Data" />
                <span>Import Data</span>
              </label>
              <input type="file" accept=".json" id="file-upload" style={{display: 'none'}} onChange={importData}/>

              <button onClick={exportData}>
                <img src={DownloadSolid} alt="Export Data" />
                <span>Export Data</span>
              </button>
            </div>
            <div className={styles.chat}>
              <div className={styles.chatContainer}>
                <div className={styles.chatSidebar}>
                  <div className={styles.sidebarHeader}>
                    <h3>Contacts</h3>
                    <button onClick={openAddContactModal}>+</button>
                  </div>
                  <div className={styles.sidebarContacts}>
                    {
                      Object.keys(chat).length > 0 ? (
                        Object.keys(chat).map((key, index) => (
                          <div className={styles.sidebarContact} key={index} onClick={()=>setSelectedChat(key)}>
                            <span>{key.length > 22 ? key.slice(0, 21) + '...' : key}</span>
                            <small onClick={()=>openContactModal(key, chat[key].publicKey)}>&#9432;</small>
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
                    {
                      selectedChat ? (
                        <div className={styles.chatHeaderButtons}>
                          <button onClick={exportChat}>
                            <img src={DownloadSolid} alt="Export Chat as TXT" />
                          </button>
                          <button onClick={()=>setSelectedChat(null)}>
                            <span>&#10005;</span>
                          </button>
                        </div>
                      ) : ''
                    }
                  </div>
                  <div className={styles.messageContainer}>
                    {
                      selectedChat ? (
                        chat[selectedChat]?.messages?.map((message, index) => (
                          <ChatMessage key={index} username={selectedChat} message={message} />
                        ))
                      ) : (
                        <div className={styles.chatWelcome}>
                          <h3>Please select a contact to chat with.</h3>
                        </div>
                      )
                    }
                    <div ref={chatMessageBottom}/>
                  </div>
                  <div className={styles.chatFooter} style={{
                    display: selectedChat ? 'flex' : 'none'
                  }}>
                    <input type="text" ref={chatMessageInput} placeholder="Type a message..."
                      value={chatMessage} onChange={(e)=>setChatMessage(e.target.value)}
                      onKeyDown={(e)=> e.key === 'Enter' ? sendMessage() : null}
                    />
                    <button onClick={sendMessage}>&rarr;</button>
                  </div>
                </div>
              </div>
            </div>
            </>
          ) : (
            <>
            <h1 className={styles.title}>
              Anonymous Live Chat
            </h1>
            <div className={styles.grid}>
              <div className={styles.card} onClick={()=>openModal(true)}>
                <h2>Generate New Keypair &rarr;</h2>
              </div>

              <div className={styles.card} onClick={()=>openModal()}>
                <h2>Load Existing Keypair &rarr;</h2>
              </div>

            </div>
            </>
          )
        }
      </main>

      <Modal open={modal.open} setOpen={setModal} generateNew={modal.type} toast={toast}/>
      <AddContact open={contactModal.open} setOpen={setContactModal} publicKey={keypair?.publicKey} socket={socket} toast={toast}/>

      <ToastContainer
        position="bottom-right"
        theme="dark"
        autoClose={2000}
      />
    </div>
  )
};

const mapStateToProps = (state) => ({ 
  socket: state.socket,
  modal: state.modal, 
  contactModal: state.contactModal, 
  keypair: state.keypair, 
  chat: state.chat 
});

export default connect(mapStateToProps)(App);
