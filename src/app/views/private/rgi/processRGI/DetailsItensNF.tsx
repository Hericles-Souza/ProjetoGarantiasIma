import {Button} from "antd";
import {DownOutlined, InfoCircleOutlined, LeftOutlined, RightOutlined} from "@ant-design/icons";
import styles from "./DetailsItensNF.module.css";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel";
import OutlinedSelectWithLabel from "@shared/components/select/OutlinedSelectWithLabel";
import {useState} from "react";
import {useNavigate, useParams} from "react-router-dom"; // Importação do hook useState

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
        icon={isVisible ? <DownOutlined/> : <RightOutlined/>}
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
      {fileOptions.map((option) => (
        <Button>
          {option.label}
        </Button>
      ))}
    </div>
  </div>
);

const DetailsItensNF: React.FC = () => {
  // Estado para controlar a visibilidade da seção
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const navigate = useNavigate();
  const {id} = useParams<{ id: string }>();
  const toggleVisibility = () => setIsSectionVisible(!isSectionVisible);

  return (
    <div className={styles.containerApp}>
      <div className={styles.containerBotaoVoltar}>
        <Button type="link" className={styles.botaoVoltar} onClick={() => navigate(`/garantias/rgi/${id}`)}>
          <LeftOutlined/> VOLTAR PARA INFORMAÇÕES DO RGI
        </Button>
        <span className={styles.cabecalhoRgi}>
                    <span className={styles.rgiPreto}>RGI N° 000666-0001</span> / NF 000666-00147.A
                </span>
      </div>

      <div className={styles.containerCabecalho}>
        <h1 className={styles.tituloRgi}>000666-00147.A</h1>
        <div className={styles.botoesCabecalho}>
          <Button type="default" className="excluir">EXCLUIR</Button>
          <Button style={{backgroundColor: "red", borderRadius: "10px"}} type="primary"
                  className="enviar">ENVIAR</Button>
        </div>
      </div>
      <hr className={styles.divisor}/>
      <FileAttachmentSection
        label="Anexo da NF de venda"
        fileOptions={[
          {
            label: "ADICIONAR ANEXO", onClick: () => {
            }
          },

        ]}
      />
      <div style={{display: "flex", justifyContent: "space-between"}}>
        <h3 className={styles.nfsTitle}>Itens desta NF associados a esta garantia</h3>
        <Button className={styles.buttonRed} style={{backgroundColor: "red", borderRadius: "10px", height: "40px"}}
                type="primary">
          ADICIONAR ANEXO
        </Button>
      </div>
      <div className={styles.dialoginfo}>
        <InfoCircleOutlined style={{color: '#0277BD'}}/>
        <span style={{color: '#0277BD'}}>Caso a peça não possua um lote, o campo Lote da peça deve ser preenchido com “Não contém”</span>
      </div>

      <div className={styles.containerInformacoes}>
        <CollapsibleSection title="000666-00147.A.01" isVisible={isSectionVisible} toggleVisibility={toggleVisibility}>

          <h3 className={styles.tituloSecao}>Informações Gerais</h3>

          <div className={styles.inputsContainer}>
            <div className={styles.inputsConjun}>
              <div className={styles.inputGroup} style={{flex: 0.5}}>
                <OutlinedInputWithLabel label="Código da peça" required value="ALR-84888" placeholder="Código da Peça"/>
              </div>
              <div className={styles.inputGroup} style={{flex: 0.5}}>
                <OutlinedInputWithLabel label="Lote da peça" required value="2547A" placeholder="Lote da Peça"/>
              </div>
            </div>

            <div className={styles.inputsConjun}>
              <div className={styles.inputGroup} style={{flex: 0.4}}>
                <OutlinedSelectWithLabel
                  label="Possível defeito"
                  required
                  options={[
                    {value: "Opção 1", label: "Opção 1"},
                    {value: "Opção 2", label: "Opção 2"},
                    {value: "Opção 3", label: "Opção 3"},
                  ]}
                  defaultValue={undefined}
                />
              </div>
              <div className={styles.inputGroup} style={{flex: 1}}>
                <OutlinedInputWithLabel
                  label="Modelo do veículo que aplicou"
                  required
                  value="Modelo X"
                  placeholder="Modelo do veículo que aplicou"
                />
              </div>
              <div className={styles.inputGroup} style={{flex: 0.3}}>
                <OutlinedInputWithLabel
                  label="Ano do veículo"
                  required
                  value="2020"
                  placeholder="Ano do Veículo"
                />
              </div>
            </div>
            <div className={styles.inputsConjun}>
              <div className={styles.inputGroup} style={{flex: 1}}>
                <OutlinedInputWithLabel
                  label="Torque aplicado à peça"
                  value="XXXXXXXXXX"
                  placeholder="Valor do Torque"
                />
              </div>
            </div>
          </div>
          <div className="containerAnexos">

          </div>
          <FileAttachmentSection
            label="Anexo da NF de Referência"
            fileOptions={[
              {
                label: "ADICIONAR ANEXO", onClick: () => {
                }
              },
            ]}
          />

          <h3 className={styles.tituloA}>Anexos de Imagens</h3>
          {["1. Foto do lado onde está a gravação IMA", "2. Foto da parte danificada/amassada/quebrada"].map((item, index) => (
            <div className={styles.itemAnexo} key={index}>
              <span className={styles.itemLabelAnexo}>{item}:</span>
              <div className={styles.botoesAnexo}>
                <Button type="primary" danger>
                  ADICIONAR ANEXO
                </Button>
              </div>
            </div>
          ))}
        </CollapsibleSection>
      </div>
    </div>
  );
};

export default DetailsItensNF;
