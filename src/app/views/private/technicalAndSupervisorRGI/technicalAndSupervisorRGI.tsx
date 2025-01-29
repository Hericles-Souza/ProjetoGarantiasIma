import React, { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import { RightOutlined, DownOutlined, LeftOutlined } from "@ant-design/icons";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import styles from "./technicalAndSupervisorRGI.module.css";
import OutlinedInputWithLabel from "../../../shared/components/input-outlined-with-label/OutlinedInputWithLabel";
import OutlinedSelectWithLabel from "../../../shared/components/select/OutlinedSelectWithLabel";
import MultilineTextFields from "../../../shared/components/multline/multLine";
import ColorCheckboxes from "@shared/components/checkBox/checkBox";

const QuillEditor = ({ editorRef }: { editorRef: React.RefObject<HTMLDivElement> }) => {
  const quillInstance = useRef(null);

  useEffect(() => {
    if (editorRef.current && !quillInstance.current) {
      quillInstance.current = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["blockquote", "code-block"],
            [{ align: [] }],
            [{ color: [] }, { background: [] }],
            ["image", "video", "link"],
            ["clean"],
          ],
        },
      });
    }

    return () => {
      if (quillInstance.current) {
        quillInstance.current = null;
      }
    };
  }, [editorRef]);

  return <div ref={editorRef} style={{ height: "300px" }} />;
};

const FileAttachment = ({ label, backgroundColor }: { label: string; backgroundColor?: string }) => {


  return (
    <div className={styles.fileAttachmentContainer} style={{ backgroundColor }}>
      <span className={styles.labelUpdate}>{label}</span>
      <div className={styles.fileUpdateContent}>

        <label className={styles.buttonUpdateNfSale}>
          Visualizar
        </label>
        <label className={styles.buttonUpdateNfSale}>
          Baixar Imagem
        </label>
      </div>
    </div>
  );
};



const CollapsibleSection = ({
  title,
  isVisible,
  toggleVisibility,
  children,
}: {
  title: string;
  isVisible: boolean;
  toggleVisibility: () => void;
  children: React.ReactNode;
}) => (
  <div>
    <div className={styles.tituloSecaoContainer}>
      <h3 className={styles.tituloSecaoVermelho}>{title}</h3>
      <Button
        type="text"
        icon={isVisible ? <DownOutlined /> : <RightOutlined />}
        onClick={toggleVisibility}
        className={styles.toggleButton}
      />
    </div>

    {isVisible && <div className={styles.hiddenContent}>{children}</div>}
  </div>
);


const InvoiceDetails: React.FC = () => {
  const [isContentVisible, setIsContentVisible] = useState(false);
  const editorRef = useRef(null);

  const toggleContentVisibility = () => {
    setIsContentVisible(!isContentVisible);
  };


  const [isReimbursementChecked, setIsReimbursementChecked] = useState(false);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsReimbursementChecked(e.target.checked);
  };


  return (
    <div className={styles.containerApp}>
      <hr className={styles.divisor} />
      <div className={styles.ContainerButtonBack}>
        <Button
          type="link"
          className={styles.ButtonBack}
          // onClick={() => navigate(`/garantias/rgi/${id}`)}
        >
          <LeftOutlined /> VOLTAR PARA INFORMAÇÕES DO RGI
        </Button>
        <span className={styles.RgiCode}>RGI N° 000666-0001 / NF 000666-00147.A</span> 
      </div>

      <div className={styles.containerCabecalho}>
        <h1 className={styles.tituloRgi}>000666-00147.A</h1>
      </div>
      <hr className={styles.divisor} />
      <h3 className={styles.nfsTitle}>
        Itens desta NF associados a esta garantia
      </h3>

      <div className={styles.containerInformacoes}>
        <CollapsibleSection
          title="000666-00147.A.01"
          isVisible={isContentVisible}

          toggleVisibility={toggleContentVisibility}
        >

          <div style={{ marginTop: "20px" }}><FileAttachment label="Anexo da NF de venda" backgroundColor="white" /></div>

          <h3 className={styles.tituloSecao}>Informações Gerais</h3>

          <div className={styles.inputsContainer}>
            <div className={styles.inputsConjun}>
              <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                <OutlinedInputWithLabel label="Código da peça" value="ALR-84888" fullWidth disabled />
              </div>
              <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                <OutlinedInputWithLabel label="Lote da peça" value="2547A" fullWidth disabled />
              </div>
            </div>

            <div className={styles.inputsConjun}>
              <div className={styles.inputGroup} style={{ flex: 0.4 }}>
                <OutlinedSelectWithLabel
                  label="Possível defeito"
                  disabled
                  fullWidth
                  options={[
                    { value: "Opção 1", label: "Opção 1" },
                    { value: "Opção 2", label: "Opção 2" },
                    { value: "Opção 3", label: "Opção 3" },
                  ]}
                  defaultValue={undefined}
                />
              </div>
              <div className={styles.inputGroup} style={{ flex: 1 }}>
                <OutlinedInputWithLabel
                  label="Modelo do veículo que aplicou"
                  fullWidth
                  disabled
                  value="Modelo X"

                />
              </div>
              <div className={styles.inputGroup} style={{ flex: 0.3 }}>
                <OutlinedInputWithLabel
                  label="Ano do veículo"
                  disabled
                  value="2020"
                  fullWidth
                />
              </div>
            </div>
            <div className={styles.inputsConjun}>
              <div className={styles.inputGroup} style={{ flex: 1 }}>
                <OutlinedInputWithLabel
                  label="Torque aplicado à peça"
                  value="XXXXXXXXXX"
                  fullWidth
                  disabled
                />
              </div>
            </div>
          </div>
          <div className={styles.checkboxContainer}>
            <ColorCheckboxes onChange={handleCheckboxChange} checked={isReimbursementChecked} />
            <label className={styles.checkboxDanger}>Solicitar ressarcimento</label>
          </div>
          {isReimbursementChecked && (
            <div className={styles.contentReimbursement}>
              <h3 className={styles.tituloA}>Anexo de dados adicionais para ressarcimento</h3>
              {["1. Documento de identificação (RG ou CNH):", "2. Documentação do veículo:", "3. NF do guincho:", "4. NF de outras despesa/produtos pertinentes:"].map(
                (item) => (
                  <FileAttachment label={item} backgroundColor="#f5f5f5" />
                )
              )}
            </div>
          )}
          <FileAttachment label="Anexo da NF de Referência" backgroundColor="white" />

          <h3 className={styles.tituloA}>Anexos de Imagens</h3>
          {["1. Foto do lado onde está a gravação IMA:", "2. Foto da parte danificada/amassada/quebrada:", "3. Foto marcações suspeitas na peça:", "4. Foto da peça completa:", "5. Outras fotos pertinentes:"].map((item) => (
            <FileAttachment label={item} backgroundColor="white" />
          ))}

          <hr className={styles.divisor} />
          <div className={styles.containerSelect}>
            <OutlinedSelectWithLabel
              label="Envio Autorizado"
              options={[
                { value: "Procedente", label: "Procedente" },
                { value: "Improcedente", label: "Improcedente" },
              ]}
            />
          </div>

          <h3 className={styles.tituloA}>Análise Técnica Visual</h3>
          <QuillEditor editorRef={editorRef} />
          <h3 className={styles.tituloA}>Conclusão</h3>
          <MultilineTextFields />
        </CollapsibleSection>
      </div>
    </div>
  );
};

export default InvoiceDetails;
