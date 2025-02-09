import React, { useContext, useEffect, useRef, useState } from "react";
import { Button } from "antd";
import { RightOutlined, DownOutlined, LeftOutlined } from "@ant-design/icons";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import styles from "./technicalAndSupervisorDetailsItens.module.css";
import OutlinedInputWithLabel from "../../../../shared/components/input-outlined-with-label/OutlinedInputWithLabel";
import OutlinedSelectWithLabel from "../../../../shared/components/select/OutlinedSelectWithLabel";
import MultilineTextFields from "../../../../shared/components/multline/multLine";
import ColorCheckboxes from "@shared/components/checkBox/checkBox";
import { UserRoleEnum } from "@shared/enums/UserRoleEnum";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";

// Componente QuillEditor
interface QuillEditorProps {
  editorRef: React.RefObject<HTMLDivElement>;
  setEditorContent: (value: string) => void;
}

const QuillEditor: React.FC<QuillEditorProps> = ({ editorRef, setEditorContent }) => {
  const quillInstance = useRef<Quill | null>(null);

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

      quillInstance.current.on("text-change", () => {
        const content = quillInstance.current?.root.innerHTML || "";
        setEditorContent(content);
      });
    }

    return () => {
      if (quillInstance.current) {
        quillInstance.current = null;
      }
    };
  }, [editorRef, setEditorContent]);

  return <div ref={editorRef} style={{ height: "300px" }} />;
};

// Componente FileAttachment
const FileAttachment = ({ label, backgroundColor }: { label: string; backgroundColor?: string }) => {
  return (
    <div className={styles.fileAttachmentContainer} style={{ backgroundColor }}>
      <span className={styles.labelUpdate}>{label}</span>
      <div className={styles.fileUpdateContent}>
        <label className={styles.buttonUpdateNfSale}>Visualizar</label>
        <label className={styles.buttonUpdateNfSale}>Baixar Imagem</label>
      </div>
    </div>
  );
};

// Componente CollapsibleSection
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

// Componente Principal
const TechnicalAndSupervisorDetailsItens: React.FC = () => {
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [envioAutorizado, setEnvioAutorizado] = useState(false);
  // const [analiseTecnica, setAnaliseTecnica] = useState(false);
  const [conclusao, setConclusao] = useState(""); 
  const context = useContext(AuthContext);

  const toggleContentVisibility = () => {
    setIsContentVisible(!isContentVisible);
  };

  const [isReimbursementChecked, setIsReimbursementChecked] = useState(false);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsReimbursementChecked(e.target.checked);
  };

  const editorRef = useRef<HTMLDivElement>(null);
  const [editorContent, setEditorContent] = useState("");

  const handleSave = () => {
    const dataToSend = {
      descricao: editorContent,
    };
    console.log("Enviando para API:", dataToSend);
    // Exemplo de requisição para a API:
    // axios.post("/api/salvar", dataToSend);
  };

  return (
    <div className={styles.containerApp}>
      <hr className={styles.divisor} />
      <div className={styles.ContainerButtonBack}>
        <Button type="link" className={styles.ButtonBack}>
          <LeftOutlined /> VOLTAR PARA INFORMAÇÕES DO RGI
        </Button>
        <span className={styles.RgiCode}>RGI N° 000666-0001 / NF 000666-00147.A</span>
      </div>

      <div className={styles.containerCabecalho}>
        <h1 className={styles.tituloRgi}>000666-00147.A</h1>

        {/* Botões visíveis apenas para não supervisores */}
        {context.user.rule.name !== UserRoleEnum.Supervisor && (
          <>
            <div className={styles.buttonsContainer}>
              <Button type="default" danger className={styles.buttonCancelRgi}>
                Cancelar
              </Button>
              <Button type="primary" onClick={handleSave} danger style={{ backgroundColor: "red" }} className={styles.buttonSaveRgi}>
                Salvar
              </Button>
            </div>
          </>
        )}
      </div>

      <hr className={styles.divisor} />
      <h3 className={styles.nfsTitle}>Itens desta NF associados a esta garantia</h3>

      <div className={styles.containerInformacoes}>
        <CollapsibleSection
          title="000666-00147.A.01"
          isVisible={isContentVisible}
          toggleVisibility={toggleContentVisibility}
        >
          {/* Anexo da NF de venda (visível apenas para não supervisores) */}
          {context.user.rule.name !== UserRoleEnum.Supervisor && (
            <div style={{ marginTop: "20px" }}>
              <FileAttachment label="Anexo da NF de venda" backgroundColor="white" />
            </div>
          )}

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

          {/* Solicitar ressarcimento (visível apenas para não supervisores) */}
          {context.user.rule.name !== UserRoleEnum.Supervisor && (
            <>
              <div className={styles.checkboxContainer}>
                <ColorCheckboxes onChange={handleCheckboxChange} checked={isReimbursementChecked} />
                <label className={styles.checkboxDanger}>Solicitar ressarcimento</label>
              </div>
              {isReimbursementChecked && (
                <div className={styles.contentReimbursement}>
                  <h3 className={styles.tituloA}>Anexo de dados adicionais para ressarcimento</h3>
                  {[
                    "1. Documento de identificação (RG ou CNH):",
                    "2. Documentação do veículo:",
                    "3. NF do guincho:",
                    "4. NF de outras despesa/produtos pertinentes:",
                  ].map((item, index) => (
                    <FileAttachment key={index} label={item} backgroundColor="#f5f5f5" />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Anexo da NF de Referência (visível para todos) */}
          <FileAttachment label="Anexo da NF de Referência" backgroundColor="white" />

          {/* Anexos de Imagens (visível apenas para não supervisores) */}
          {context.user.rule.name !== UserRoleEnum.Supervisor && (
            <>
              <h3 className={styles.tituloA}>Anexos de Imagens</h3>
              {[
                "1. Foto do lado onde está a gravação IMA:",
                "2. Foto da parte danificada/amassada/quebrada:",
                "3. Foto marcações suspeitas na peça:",
                "4. Foto da peça completa:",
                "5. Outras fotos pertinentes:",
              ].map((item, index) => (
                <FileAttachment key={index} label={item} backgroundColor="white" />
              ))}

              <hr className={styles.divisor} />
              <div className={styles.containerSelect}>
                <OutlinedSelectWithLabel
                  label="Envio Autorizado"
                  options={[
                    { value: "Procedente", label: "Procedente" },
                    { value: "Improcedente", label: "Improcedente" },
                  ]}
                  value={envioAutorizado}
                  onChange={(e) => setEnvioAutorizado(e.target.value)}
                />
              </div>

              <h3 className={styles.tituloA}>Análise Técnica Visual</h3>
              <QuillEditor editorRef={editorRef} setEditorContent={setEditorContent} />

              <h3 className={styles.tituloA}>Conclusão</h3>
              <MultilineTextFields
                value={conclusao}
                onChange={(e) => setConclusao(e.target.value)}
                label="Conclusão"
                placeholder="Digite a conclusão aqui..."
              />
            </>
          )}
        </CollapsibleSection>
      </div>
    </div>
  );
};

export default TechnicalAndSupervisorDetailsItens;