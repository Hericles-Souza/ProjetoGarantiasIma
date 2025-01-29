import React, { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import { RightOutlined, DownOutlined, LeftOutlined } from "@ant-design/icons";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import styles from "./InvoiceDetails.module.css";
import OutlinedInputWithLabel from "../../../shared/components/input-outlined-with-label/OutlinedInputWithLabel";
import OutlinedSelectWithLabel from "../../../shared/components/select/OutlinedSelectWithLabel";
import MultilineTextFields from "../../../shared/components/multline/multLine";

const QuillEditor = ({ editorRef }: { editorRef: React.RefObject<HTMLDivElement> }) => {
  const quillInstance = useRef(null);

  useEffect(() => {
    if (editorRef.current && !quillInstance.current) {
      // Inicializa o Quill apenas uma vez
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

    // Cleanup da instância Quill ao desmontar o componente
    return () => {
      if (quillInstance.current) {
        quillInstance.current = null;
      }
    };
  }, [editorRef]);

  return <div ref={editorRef} style={{ height: "300px" }} />;
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

const FileAttachmentSection = ({
  label,
  fileOptions,
}: {
  label: string;
  fileOptions: { label: string; onClick: () => void }[];
}) => (
  <div className={styles.containerAnexo}>
    <span className={styles.labelAnexo}>{label}</span>
    <div className={styles.botoesAnexo}>
      {fileOptions.map((option, index) => (
        <Button
          key={index}
          type={option.type || "default"}
          onClick={option.onClick}
          danger={option.danger || false}
        >
          {option.label}
        </Button>
      ))}
    </div>
  </div>
);

const InvoiceDetails: React.FC = () => {
  const [isContentVisible, setIsContentVisible] = useState(false);
  const editorRef = useRef(null);

  const toggleContentVisibility = () => {
    setIsContentVisible(!isContentVisible);
  };

  return (
    <div className={styles.containerApp}>
      <hr className={styles.divisor} />
      <div className={styles.containerBotaoVoltar}>
        <Button
          type="link"
          className={styles.botaoVoltar}
          onClick={() => console.log("Voltar para Informações do RGI")}
        >
          <LeftOutlined /> VOLTAR PARA INFORMAÇÕES DO RGI
        </Button>
        <span className={styles.cabecalhoRgi}>
          <span className={styles.rgiPreto}>RGI N° 000666-0001</span> / NF
          000666-00147.A
        </span>
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
          <FileAttachmentSection
            label="Anexo da NF de venda"
            fileOptions={[
              { label: "VISUALIZAR", onClick: () => console.log("Visualizar") },
              { label: "BAIXAR ARQUIVO", onClick: () => console.log("Baixar") },
            ]}
          />

          <h3 className={styles.tituloSecao}>Informações Gerais</h3>

          <div className={styles.inputsContainer}>
            {/* Repeating input groups can be modularized into their own component */}
            <div className={styles.inputsConjun}>
              <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                <OutlinedInputWithLabel label="Código da peça" required value="ALR-84888" placeholder="Código da Peça" />
              </div>
              <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                <OutlinedInputWithLabel label="Lote da peça" required value="2547A" placeholder="Lote da Peça" />
              </div>
            </div>

            <div className={styles.inputsConjun}>
              <div className={styles.inputGroup} style={{ flex: 0.4 }}>
                <OutlinedSelectWithLabel
                  label="Possível defeito"
                  required
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
                  required
                  value="Modelo X"
                  placeholder="Modelo do veículo que aplicou"
                />
              </div>
              <div className={styles.inputGroup} style={{ flex: 0.3 }}>
                <OutlinedInputWithLabel
                  label="Ano do veículo"
                  required
                  value="2020"
                  placeholder="Ano do Veículo"
                />
              </div>
            </div>
            <div className={styles.inputsConjun}>
              <div className={styles.inputGroup} style={{ flex: 1 }}>
                <OutlinedInputWithLabel
                  label="Torque aplicado à peça"
                  value="XXXXXXXXXX"
                  placeholder="Valor do Torque"
                />
              </div>
            </div>
          </div>

          <FileAttachmentSection
            label="Anexo da NF de Referência"
            fileOptions={[
              { label: "VISUALIZAR", onClick: () => console.log("Visualizar") },
              { label: "BAIXAR ARQUIVO", onClick: () => console.log("Baixar") },
            ]}
          />

          <h3 className={styles.tituloA}>Anexos de Imagens</h3>
          {["1. Foto do lado onde está a gravação IMA", "2. Foto da parte danificada/amassada/quebrada"].map((item, index) => (
            <div className={styles.itemAnexo} key={index}>
              <span className={styles.itemLabelAnexo}>{item}:</span>
              <div className={styles.botoesAnexo}>
                <Button type="default" danger>
                  VISUALIZAR
                </Button>
                <Button type="primary" danger>
                  BAIXAR ARQUIVO
                </Button>
              </div>
            </div>
          ))}

          <hr className={styles.divisor} />
          <div className={styles.containerSelect}>
            <OutlinedSelectWithLabel
              label="Envio Autorizado"
              options={[
                { value: "Garantia procedente", label: "Garantia procedente" },
                { value: "Garantia improcedente", label: "Garantia improcedente" },
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
