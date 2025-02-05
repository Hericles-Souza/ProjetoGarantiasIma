import React, { useContext, useEffect, useState } from "react";
import { Button, Modal } from "antd";
import { DeleteOutlined, FileOutlined, LeftOutlined } from "@ant-design/icons";
import styles from "./RGIDetailsInitial.module.css";
import { useNavigate, useParams } from "react-router-dom";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel.tsx";
import { getGarantiaByIdAsync } from "@shared/services/GarantiasService.ts";
import { GarantiasModel } from "@shared/models/GarantiasModel.ts";
import dayjs from "dayjs";
import NFModal from "../addNewNF/modalAddNewNF";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";

const RGIDetailsInitial: React.FC = () => {
  const [socialReason, setSocialReason] = useState("");
  const [phone, setPhone] = useState("");
  const [requestDate, setRequestDate] = useState("");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cardData, setCardData] = useState<GarantiasModel>();
  const [modalOpen, setModalOpen] = useState(false);
  const [nfs, setNfs] = useState<{ nf: string; itens: number }[]>([]);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false); 
  const [nfToDelete, setNfToDelete] = useState<string>(""); 
  const context = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getGarantiaByIdAsync(id);
        const data = response.data.data as GarantiasModel;
        setSocialReason(data.razaoSocial);
        setPhone(data.telefone);
        setRequestDate(dayjs(data.data).format("DD/MM/YYYY"));
        setCardData(data);
        setNfs([{ nf: data.nf, itens: data.itens.length }]); 
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

  const handleAddNF = (nfNumber: string) => {
    setNfs((prevNfs) => [...prevNfs, { nf: nfNumber, itens: 0 }]); 
  };

  const handleDeleteNF = () => {
    
    setNfs((prevNfs) => prevNfs.filter((nf) => nf.nf !== nfToDelete));
    setModalDeleteOpen(false);
  };

  const showDeleteConfirm = (nfNumber: string) => {
    setNfToDelete(nfNumber);
    setModalDeleteOpen(true); 
  };

  const save = () => {
    nfs.forEach((element) => {
      console.log("itens: " + element.itens);
      console.log("nf: " + element.nf);

    });
  }

  const send = () => {
    nfs.forEach((element) => {
      console.log("itens: " + element.itens);
      console.log("nf: " + element.nf);

    });
  }

  return (
    <div className={styles.appContainer} style={{ backgroundColor: "#fffff" }}>
      <div className={styles.ContainerButtonBack}>
        <Button type="link" className={styles.ButtonBack} onClick={() => navigate("/garantias")}>
          <LeftOutlined /> VOLTAR PARA O INÍCIO
        </Button>
        <span className={styles.RgiCode}>RGI N° {context.user.codigoCigam}-</span>
      </div>

      <div className={styles.headerContainer}>
        <div className={styles.headerLeft}>
          <h1 className={styles.rgiTitle}>RGI 000666-0001</h1>
          <div className={styles.statusTag}>Aguardando avaliação</div>
        </div>
        <div className={styles.buttonsContainer}>
          <Button type="default" danger className={styles.buttonDeleteRgi}>
            Excluir
          </Button>
          <Button onClick={save} type="default" danger className={styles.buttonSaveRgi}>
            Salvar
          </Button>
          <Button onClick={send} type="primary" danger  style={{ backgroundColor: "red" }} className={styles.buttonSendRgi}>
            Enviar
          </Button>
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.infoContainer}>
        <h3 className={styles.infoTitle}>Informações Gerais</h3>
        <div className={styles.inputsContainer}>
          <div className={styles.inputGroup} style={{ flex: 15 }}>
            <OutlinedInputWithLabel InputProps={{ readOnly: true }} label="Razão social" value={socialReason} fullWidth disabled />
          </div>
          <div className={styles.inputGroup} style={{ flex: 5 }}>
            <OutlinedInputWithLabel InputProps={{ readOnly: true }} label="Telefone" value={phone} fullWidth disabled/>
          </div>
          <div className={styles.inputGroup} style={{ flex: 5 }}>
            <OutlinedInputWithLabel InputProps={{ readOnly: true }} label="Data da solicitação" value={requestDate} fullWidth disabled/>
          </div>
        </div>
        {/* <div className={styles.checkboxContainer}>
          <ColorCheckboxes />
          <label className={styles.checkboxDanger}>Solicitar ressarcimento</label>
        </div> */
        }
      </div>

      <div className={styles.nfsContainer}>
        <div className={styles.nfcont}>
          <h3 className={styles.nfsTitle}>NFs associadas a esta garantia</h3>
          <Button type="primary" danger style={{ height: "45px", borderRadius: "10px", backgroundColor:"red" }} onClick={() => setModalOpen(true)}>
            Adicionar NF de Origem
          </Button>
        </div>
        
        {nfs.map((nf, index) => (
          <div key={index} className={styles.nfsItem} >
            <div style={{ display: "flex", alignItems: "center" }}>
              <FileOutlined style={{ marginRight: "10px", marginLeft: "20px", fontSize: "20px", color: "red" }} />
              <span className={styles.nfsCode}>{nf.nf}</span>
              <span className={styles.nfsDivider}> | </span>
              <span className={styles.nfsQuantity}> {nf.itens}  ITENS</span>
            </div>
            <div style={{display: "flex", alignItems: "center"}}>
              <DeleteOutlined style={{ color: "#555", fontSize: "22px" }} className={styles.DeleteOutlined} onClick={() => showDeleteConfirm(nf.nf)} />
              <Button type="text" className={styles.nextButton} onClick={() => navigate(`/garantias/rgi/details-itens-nf/${id}`)}>
                &gt;
              </Button>
            </div>
          </div>
        ))}
      </div>

      <NFModal open={modalOpen} onOpenChange={setModalOpen} onAddNF={handleAddNF} />

      <Modal
        title="Confirmar Exclusão"
        visible={modalDeleteOpen}
        onOk={handleDeleteNF}
        onCancel={() => setModalDeleteOpen(false)}
        okText="Excluir"
        cancelText="Cancelar"
        okButtonProps={{
          style: { backgroundColor: "red", borderColor: "red", color: "white" }, 
        }}
        cancelButtonProps={{
          style: { borderColor: "#dadada", color: "#5F5A56" },
        }}
      >
        <p>Você tem certeza de que deseja excluir esta NF?</p>
      </Modal>
    </div>
  );
};

export default RGIDetailsInitial;
