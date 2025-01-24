import React, { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import { RightOutlined, DownOutlined, LeftOutlined } from "@ant-design/icons";

import Quill from "quill";
import "quill/dist/quill.snow.css";
import styles from "./InvoiceDetails.module.css";
import OutlinedInputWithLabel from "../../../shared/components/input-outlined-with-label/OutlinedInputWithLabel";
import OutlinedSelectWithLabel from "../../../shared/components/select/OutlinedSelectWithLabel";
import MultilineTextFields from '../../../shared/components/multline/multLine';

const InvoiceDetails: React.FC = () => {
  const [isContentVisible, setIsContentVisible] = useState(false);
  const editorRef = useRef(null);
  const quillInstance = useRef(null);

  const toggleContentVisibility = () => {
    setIsContentVisible(!isContentVisible);
  };

  useEffect(() => {
    
    if (!quillInstance.current && editorRef.current) {
    
      editorRef.current.innerHTML = "";


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
  }, []); 


  return (
    <div className={styles.containerApp}>
      <hr className={styles.divisor} />

      {/* Botão Voltar e RGI */}
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
        <div className={styles.tituloSecaoContainer}>
          <h3 className={styles.tituloSecaoVermelho}>000666-00147.A.01</h3>
          <Button
            type="text"
            icon={isContentVisible ? <DownOutlined /> : <RightOutlined />}
            onClick={toggleContentVisibility}
            className={styles.toggleButton}
          />
        </div>

        {isContentVisible && (
          <div className={styles.hiddenContent}>
            {/* Anexo da NF de Vendas */}
            <div className={styles.containerAnexo}>
              <span className={styles.labelAnexo}>Anexo da NF de Vendas</span>
              <div className={styles.botoesAnexo}>
                <Button type="default" danger>
                  VISUALIZAR
                </Button>
                <Button type="primary" danger>
                  BAIXAR ARQUIVO
                </Button>
              </div>
            </div>

            {/* Informações Gerais */}
            <h3 className={styles.tituloSecao}>Informações Gerais</h3>

            <div className={styles.inputsContainer}>
              <div className={styles.inputsConjun}>
                <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                  <OutlinedInputWithLabel
                    label="Código da peça"
                    required
                    value="ALR-84888"
                    placeholder="Código da Peça"
                  />
                </div>
                <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                  <OutlinedInputWithLabel
                    label="Lote da peça "
                    required
                    value="2547A"
                    placeholder="Lote da Peça"
                  />
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
                    label="Modelo do veículo que aplicou "
                    required
                    value="Modelo X"
                    placeholder="Modelo do veículo que aplicou"
                  />
                </div>
                <div className={styles.inputGroup} style={{ flex: 0.3 }}>
                  <OutlinedInputWithLabel
                    label="Ano do veículo "
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

            {/* Anexos */}
            <div className={styles.containerAnexo}>
              <span className={styles.labelAnexo}>
                Anexo da NF de Referência
              </span>
              <div className={styles.botoesAnexo}>
                <Button type="default" danger>
                  VIZUALIZAR
                </Button>
                <Button type="primary" danger>
                  BAIXAR ARQUIVO
                </Button>
              </div>
            </div>

            <h3 className={styles.tituloA}>Anexos de Imagens</h3>
            <ul className={styles.listaAnexosImagens}>
              {[
                "Foto do lado com a gravação IMA:",
                "Foto da peça danificada/amassada/quebrada:",
                "Foto de marcas suspeitas na peça:",
                "Foto da peça completa:",
                "Outras fotos relevantes:",
              ].map((label, index) => (
                <li key={index} className={styles.itemAnexoImagem}>
                  <span>
                    {index + 1}. {label}
                  </span>
                  <div className={styles.botoesAnexo}>
                    <Button type="default" danger>
                      VIZUALIZAR
                    </Button>
                    <Button type="primary" danger>
                      BAIXAR ARQUIVO
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <hr className={styles.divisor} />
            {/* Envio Autorizado */}
            <div className={styles.containerSelect}>
            <div className={styles.containerSelected}>
              <label className={styles.labelInput}></label>
              <OutlinedSelectWithLabel
                label="Envio Autorizado"
                options={[
                  {
                    value: "Garantia procedente",
                    label: "Garantia procedente",
                  },
                  {
                    value: "Garantia improcedente",
                    label: "Garantia improcedente",
                  },
                ]}
                defaultValue={undefined}
                style={{
                  width: "300px", 
                  height: "40px", 
                  borderRadius: "4px 4px 0 0", 
                }}
              />
               </div>
            </div>

            <h3 className={styles.tituloA}>Análise Técnica Visual</h3>
            <div> 
            <div ref={editorRef} style={{ height: "300px" }} />
            </div>

          
            <h3 className={styles.tituloA}>Conclusão</h3>
            <MultilineTextFields />
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetails;
