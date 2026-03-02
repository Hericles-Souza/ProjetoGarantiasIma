/* eslint-disable @typescript-eslint/no-unused-vars */
import { useContext, useEffect, useRef, useState } from "react";
import { Button, message, Spin } from "antd";
import {
  DownOutlined,
  LeftOutlined,
  FileOutlined,
  RightOutlined,
} from "@ant-design/icons";
import styles from "./technicalAndSupervisorDetailsItens.module.css";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getItemsByNfAsync } from "@shared/services/AcordoComercialService";
import { NfItem } from "@shared/models/AcordoComercialModel";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import { UserRoleEnum } from "@shared/enums/UserRoleEnum";
import OutlinedSelectWithLabel from "@shared/components/select/OutlinedSelectWithLabel";
import ColorCheckboxes from "@shared/components/checkBox/checkBox";
import MultilineTextFields from "@shared/components/multline/multLine";
import api from "@shared/Interceptors";
import {
  GarantiasModel,
  UpdateItemRequest,
} from "@shared/models/GarantiasModel";
import {
  converterStatusGarantia,
  converterStatusGarantiaInverso,
  GarantiasItemStatusEnum,
  GarantiasItemStatusEnum2,
  GarantiasStatusEnum,
  GarantiasStatusEnum2,
  StatusColors,
  statusStylesRGI,
} from "@shared/enums/GarantiasStatusEnum";
import environment from "@env/environment.ts";
import { NotaFiscal } from "@shared/models/NotaFiscalModel";
import React from "react";
import FileAttachmentDevolucao from "@shared/components/FileAttachmentDevolucao/FileAttachmentDevolucao";
import { Defect } from "@shared/models/DefectModel";
import { getDefect } from "@shared/services/defectService";
import { updateGarantiaItemByIdAsync } from "@shared/services/GarantiasService";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { QuillItemEditor } from "@shared/components/quillItemEditor/QuillItemEditor";


const RichTextItemEditor = React.memo(
  ({
    itemId,
    value,
    disabled,
    onChangeHtml,
  }: {
    itemId: string;
    value: string;
    disabled?: boolean;
    onChangeHtml: (html: string) => void;
  }) => {
    const context = useContext(AuthContext);

    // Editor instance por item (key externa no map garante isolamento)
    const editor = useEditor({
      extensions: [
        StarterKit,
        Image.configure({
          inline: false,
          allowBase64: true, // permite dataURI se você optar por base64
        }),
      ],
      content: value || "<p></p>",
      immediatelyRender: false, // evita warning/issue em alguns setups [web:20]
      editable: !disabled,
      onUpdate: ({ editor }) => {
        onChangeHtml(editor.getHTML());
      },
    });

    // Mantém editor sincronizado se o value vier do backend/reload
    useEffect(() => {
      if (!editor) return;
      const current = editor.getHTML();
      if ((value || "<p></p>") !== current) {
        editor.commands.setContent(value || "<p></p>");
      }
    }, [value, editor]);

    const handlePickImage = async () => {
      if (!editor) return;

      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;

        try {
          // Ajuste o endpoint conforme seu backend.
          // A ideia é: enviar arquivo e receber uma URL (public ou private).
          const form = new FormData();
          form.append("file", file);
          form.append("itemId", itemId);

          const res = await fetch(`${environment.apiUrl}/files/files/upload-private-image-editor`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${context.user.token}`,
            },
            body: form,
          });

          if (!res.ok) {
            message.error("Falha ao enviar imagem.");
            return;
          }

          // Espera algo tipo: { url: "https://..." }
          const data = await res.json();
          const url = data?.url;
          if (!url) {
            message.error("Backend não retornou a URL da imagem.");
            return;
          }

          editor.commands.setImage({ src: url }); // [web:59]
        } catch (e) {
          message.error("Erro ao enviar imagem.");
        }
      };

      input.click();
    };

    if (!editor) return null;

    return (
      <div style={{ marginTop: 12 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <Button
            size="small"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={disabled}
          >
            Negrito
          </Button>
          <Button
            size="small"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={disabled}
          >
            Itálico
          </Button>
          <Button size="small" icon={<FileOutlined />} onClick={handlePickImage} disabled={disabled}>
            Inserir imagem
          </Button>
        </div>

        <div
          style={{
            border: "1px solid #dadada",
            borderRadius: 8,
            padding: 10,
            background: "#fff",
          }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  }
);



// Componente FileAttachment
const FileAttachment = React.memo(
  ({
    label,
    backgroundColor,
    itemId,
    isRessarcimento,
  }: {
    label: string;
    backgroundColor?: string;
    itemId: string;
    isRessarcimento: boolean;
  }) => {
    const [imagemUrl, setImagemUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const context = useContext(AuthContext);

    const [recFile, setRecFile] = useState<{
      fileNameWithExtension: string;
      imagemUrl: string;
    }>();

    useEffect(() => {
      if (itemId) {
        let fieldFile: string = "";
        const matchField = label.match(/^\d+/);

        if (label.includes("venda")) fieldFile = "nfVenda";
        else if (label.includes("devolução")) fieldFile = "nfDev";
        else if (label.includes("compra")) fieldFile = "nfRef";
        else if (matchField) {
          if (isRessarcimento) fieldFile = `${matchField[0]}.res`;
          else fieldFile = `${matchField[0]}.img`;
        }

        fetchImagem(itemId, fieldFile);
      }
    }, [itemId, label, isRessarcimento]);

    function getExtensionFromMimeType(mimeType: string): string {
      const mimeTypes: { [key: string]: string } = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/gif": ".gif",
        "application/pdf": ".pdf",
        "application/msword": ".doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          ".docx",
        "application/zip": ".zip",
        "audio/mpeg": ".mp3",
        "video/mp4": ".mp4",
      };
      return mimeTypes[mimeType] || "";
    }

    function getFileExtensionFromBlob(blob: Blob): string {
      const mimeType = blob.type;
      const extension = getExtensionFromMimeType(mimeType);
      return extension;
    }

    const fetchImagem = async (itemId: string, field: string) => {
      try {
        const urlGetFile =
          environment.apiUrl +
          `/files/files/download-private-file-item/${itemId}/${field}`;

        const response = await fetch(urlGetFile, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${context.user.token}`,
          },
        });

        if (response.ok) {
          const blob = await response.blob();
          const fileExtension = getFileExtensionFromBlob(blob);
          const fieldNameFormatted = field.replace(".", "_");
          const fileNameWithExtension = `${fieldNameFormatted}${fileExtension}`;
          const imagemUrl = URL.createObjectURL(blob);
          setImagemUrl(imagemUrl);
          setRecFile({ fileNameWithExtension, imagemUrl });
        } else {
          setRecFile({ fileNameWithExtension: "", imagemUrl: "" });
        }
      } catch (error) {
        console.error("Erro na requisição", error);
      }
    };

    const handleDownload = async (fileName: string, imageUrl: string) => {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = fileName;
      link.click();
    };

    return (
      <div
        className={styles.fileAttachmentContainer}
        style={{ backgroundColor }}
      >
        <span className={styles.labelAnexo}>{label}</span>
        {recFile?.fileNameWithExtension === "" && recFile?.imagemUrl === "" && (
          <label
            className={styles.buttonUpdateNfSale}
            style={{ cursor: "default", opacity: 0.6 }}
          >
            Nenhum arquivo enviado
          </label>
        )}
        {recFile?.fileNameWithExtension != "" && recFile?.imagemUrl != "" && (
          <div className={styles.fileUpdateContent}>
            <label className={styles.buttonUpdateNfSale}>
              <button
                style={{ backgroundColor: "red", display: "none" }}
                onClick={() =>
                  handleDownload(
                    recFile.fileNameWithExtension,
                    recFile.imagemUrl
                  )
                }
              />
              Baixar Arquivo
            </label>
          </div>
        )}
      </div>
    );
  }
);

// Componente CollapsibleSection
const CollapsibleSection = ({
  title,
  isVisible,
  toggleVisibility,
  children,
  handleConfirm,
  statusGarantia,
}: {
  title: string;
  isVisible: boolean;
  toggleVisibility: () => void;
  children: React.ReactNode;
  handleConfirm: () => void;
  statusGarantia: string;
}) => {
  const context = useContext(AuthContext);

  const statusStyleMapping: Record<
    string,
    { backgroundColor: string; color: string }
  > = {
    [GarantiasItemStatusEnum.AUTORIZADO]:
      statusStylesRGI[GarantiasItemStatusEnum.AUTORIZADO],
    [GarantiasItemStatusEnum.NAO_AUTORIZADO]:
      statusStylesRGI[GarantiasItemStatusEnum.NAO_AUTORIZADO],
    [GarantiasItemStatusEnum.NAO_ANALISADO]:
      statusStylesRGI[GarantiasItemStatusEnum.NAO_ANALISADO],
    [GarantiasItemStatusEnum.ENVIO_AUTORIZADO]:
      statusStylesRGI[GarantiasItemStatusEnum.ENVIO_AUTORIZADO],
    [GarantiasItemStatusEnum.ENVIO_NAO_AUTORIZADO]:
      statusStylesRGI[GarantiasItemStatusEnum.ENVIO_NAO_AUTORIZADO],
  };

  const style = statusStyleMapping[statusGarantia] || {
    backgroundColor: "#CCC",
    color: "#CCC",
  };

  return (
    <div>
      <div className={styles.tituloSecaoContainer}>
        <div className={styles.headerLeft}>
          <h3 className={styles.tituloSecaoVermelho}>{title}</h3>
          <div
            style={{
              color: style.color,
              backgroundColor: `${style.backgroundColor}26`, // Adiciona opacidade
              padding: "4px 8px",
              borderRadius: "4px",
              display: "inline-block",
            }}
            className={styles.statusTag}
          >
            {statusGarantia || "Carregando..."}
          </div>
        </div>
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
};

const TechnicalAndSupervisorDetailsItens: React.FC = () => {
  const [isContentVisible, setIsContentVisible] = useState<{
    [key: string]: boolean;
  }>({});
  const [envioAutorizado, setEnvioAutorizado] = useState("");
  const [conclusao, setConclusao] = useState("");
  const context = useContext(AuthContext);
  const [items, setItems] = useState<NfItem[]>();
  const [cardData, setCardData] = useState<GarantiasModel | null>(null);
  const [notaFiscal, setNotaFiscal] = useState<NotaFiscal>();
  const { id } = useParams<{ id: string }>();
  const [recRgiLetter, setRecRgiLetter] = useState("");
  const [loading, setLoading] = useState(true);
  const [defects, setDefects] = useState<Defect[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [isAnalysisConcluded, setIsAnalysisConcluded] = useState(
    location.state?.isAnalysisConcluded || false
  );
  const [imageMapsByItem, setImageMapsByItem] = useState<Record<string, Record<string, string>>>({});


  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

  const fetchItems = async () => {
    try {
      if (location.state) {
        const itemsResponse = await getItemsByNfAsync(location.state.nota.id);
        itemsResponse.data.forEach((item) => {
          if (item.tipoDefeito == null) item.tipoDefeito = "";
        });

        // Se a garantia tiver codigoStatus 7, remove os itens com status 9 ou 11
        const itensFiltrados =
          location.state.garantia.codigoStatus === 12
            ? itemsResponse.data.filter(
              (item) =>
                item.status !== GarantiasItemStatusEnum.NAO_AUTORIZADO &&
                item.status !== GarantiasItemStatusEnum.ENVIO_NAO_AUTORIZADO &&
                item.status !== GarantiasItemStatusEnum.ENVIO_NF_DEV_NAO_AUTORIZADO

            )
            : itemsResponse.data;

        console.log("itensFiltrados: ", itensFiltrados);

        setItems(itensFiltrados);

        const updatedCardData = { ...location.state.garantia };
        setCardData(updatedCardData);

        setNotaFiscal((prev) => ({
          ...prev,
          ...location.state.nota,
          itens: itensFiltrados,
        }));

        if (updatedCardData.codigoStatus == GarantiasStatusEnum2.EM_ANALISE) {
          setIsAnalysisConcluded(false);
        } else if (
          updatedCardData.codigoStatus ==
          GarantiasStatusEnum2.EM_ANALISE_SUPERVISOR
        ) {
          setIsAnalysisConcluded(true);
        }
        const defects = await getDefect(1, 1000);
        const filteredDefects = defects.data.filter(
          (defect) => defect.tipoDefeito.tipoDefeito === "Tecnico"
        );
        setDefects(filteredDefects);

        setRecRgiLetter(location.state.nf.split(".")[1]);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [location.state]);

  const toggleContentVisibility = (itemId: string) => {
    setIsContentVisible((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInputChange = (itemId: string, field: string, value: any) => {
    setNotaFiscal((prevNotaFiscal) => {
      if (prevNotaFiscal) {
        return {
          ...prevNotaFiscal,
          itens: prevNotaFiscal.itens.map((item) =>
            item.id === itemId
              ? field === "solicitarRessarcimento"
                ? { ...item, solicitarRessarcimento: value }
                : { ...item, [field]: value }
              : item
          ),
        };
      }
    });
  };

  const handleUpdateNote = async (notaFiscal: NotaFiscal, refuse: boolean) => {
    if (refuse) {
      // Open the modal for conclusion input
      notaFiscal.tipo_nota = "Recusada";
      return;
    } else {
      notaFiscal.tipo_nota = "Aprovada";
      const payloadNotaFiscal: NotaFiscal = {
        garantiaId: notaFiscal.garantia_id,
        codigo: notaFiscal.codigo,
        codigoRGI: notaFiscal.rgi,
        tipo_nota: notaFiscal.tipo_nota,
        data_emissao: notaFiscal.data_emissao,
        id_referencia: notaFiscal.id_referencia,
        data_atualizacao: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
        itens: notaFiscal.itens,
        id: notaFiscal.id,
        observacao: "",
      };

      // console.log("notaFiscalUpdate: ", payloadNotaFiscal);
      const responseUpdate = await api.put(
        `/nota-fiscal/update/${notaFiscal.id}`,
        payloadNotaFiscal
      );

      if (responseUpdate.status === 200) {
        message.success("Nota Aprovada com sucesso");
      }
    }
    // If approving, proceed without modal
  };

  const handleConfirm = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

    const garantia: GarantiasModel = {
      razaoSocial: location.state.garantia.razaoSocial,
      telefone: location.state.garantia.telefone,
      email: context.user.email,
      nf: cardData?.nf || "",
      fornecedor: context.user.fullname,
      codigoStatus: GarantiasStatusEnum2.CONFIRMADA,
      observacao: "teste",
      usuarioAtualizacao: context.user.username,
      status: GarantiasStatusEnum.CONFIRMADA,
      dataAtualizacao: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
      frete: cardData.frete,
      duplicata: cardData.duplicata,
    };

    const responseHeader = await api.put(
      `/garantias/garantiasHeader/${location.state.garantia.id}/UpdateHeader`,
      garantia
    );

    if (responseHeader.status === 200) {
      message.success("Garantia confirmada com sucesso");
    }
  };

  function normalizeAnaliseHtml(html: string, imagesMap: Record<string, string>): string {
    if (!html) return "";

    return html.replace(/<img[^>]+src="([^"]+)"[^>]*>/g, (match, src) => {
      const newSrc = imagesMap[src];
      if (!newSrc) return match;
      return match.replace(src, newSrc);
    });
  }

  const addImageMapping = (itemId: string, localSrc: string, remoteUrl: string) => {
    setImageMapsByItem((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {}),
        [localSrc]: remoteUrl,
      },
    }));
  };

  const getItemImageMap = (itemId: string): Record<string, string> =>
    imageMapsByItem[itemId] || {};


  const handleSave = async () => {
    if (!cardData?.notas) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

    const promises = notaFiscal?.itens?.map(async (item) => {
      if (item.status == "Não autorizado") {
        if (item.conclusao == null || item.tipoDefeitoOficial == null) {
          message.error(
            "Item " +
            item.codigoItem +
            " precisa ter os campos Conclusao e Defeito!"
          );
          return;
        }
      }

      const imagesMap = getItemImageMap(item.id);
      const analiseTecnicaImagensTratadas = normalizeAnaliseHtml(item.analiseTecnica, imagesMap);


      const dataToSend = {
        ItemId: item.id,
        conclusao: item.conclusao || "",
        status: item.status || GarantiasItemStatusEnum.NAO_ANALISADO,
        codigoStatus:
          item.codigoStatus || GarantiasItemStatusEnum2.NAO_ANALISADO,
        tipoDefeitoOficial: item.tipoDefeitoOficial || "",
        analiseTecnica: analiseTecnicaImagensTratadas,
      };

      const garantia: GarantiasModel = {
        razaoSocial: cardData.razaoSocial,
        telefone: cardData.telefone,
        email: context.user.email,
        nf: cardData.notas[0].codigo,
        codigoRGI: cardData.codigoRGI || cardData.rgi,
        fornecedor: context.user.fullname,
        codigoStatus: cardData.codigoStatus,
        observacao: "teste",
        usuarioAtualizacao: context.user.username,
        status: cardData.status,
        dataAtualizacao: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
        frete: cardData.frete,
        duplicata: cardData.duplicata || "",
        transportadora: cardData.frete ? cardData.transportadora : "",
      };


      const responseHeader = await api.put(
        `/garantias/garantiasHeader/${cardData.id}/UpdateHeader`,
        garantia
      );

      if (responseHeader.status === 200) {
        message.success("Garantia atualizada com sucesso!");
        navigate(`/garantias/technical-and-supervisor/${cardData.id}`, {
          state: { item: garantia, garantia: cardData },
        });
      }
      try {
        const response = await api.put(
          `/garantias/analisetecnica/`,
          dataToSend
        );

        if (response.status === 200) {
          message.success("Dados salvos com sucesso!");
        } else {
          message.error(`Falha ao salvar o item ${item.codigoItem}.`);
        }
      } catch (error) {
        console.error(`Erro ao salvar o item ${item.codigoItem}:`, error);
        message.error(`Erro ao salvar o item ${item.codigoItem}.`);
      }
    });

    await Promise.all(promises || []);

    // Recarregar os dados do backend para atualizar os status na interface
    await fetchItems();
  };

  const handleSaveNFDev = async () => {
    if (!cardData?.notas) return;

    const isValid = notaFiscal?.itens?.every(
      (item) =>
        item.codigoStatus ===
        GarantiasItemStatusEnum2.ENVIO_NF_DEV_AUTORIZADO ||
        item.codigoStatus ===
        GarantiasItemStatusEnum2.ENVIO_NF_DEV_NAO_AUTORIZADO
    );

    if (!isValid) {
      message.error("É necessário avaliar todos os itens!");
    }

    const promises = notaFiscal?.itens?.map(async (item) => {
      const payloadUpdateItem = {
        codigoItem: item.codigoItem,
        tipoDefeito: item.tipoDefeito,
        torqueAplicado:
          item.torqueAplicado != null ? Number(item.torqueAplicado) : 0,
        modeloVeiculoAplicado: item.modeloVeiculoAplicado || "",
        nfReferencia: item.nfReferencia,
        codigoPeca: item.codigoPeca,
        loteItemOficial: item.loteItem || "",
        loteItem: item.loteItem || "",
        anoVeiculo: item.anoVeiculo || "",
        codigoStatus: item.codigoStatus,
        solicitarRessarcimento: item.solicitarRessarcimento ? 1 : 0,
      };


      try {
        const response = await api.put(
          `/garantias/garantiasItem/${item.id}/UpdateItem`,
          payloadUpdateItem
        );

        if (response.status === 200) {
          message.success("Dados salvos com sucesso!");
        } else {
          message.error(`Falha ao salvar o item ${item.codigoItem}.`);
        }
      } catch (error) {
        message.error(`Erro ao salvar o item ${item.codigoItem}.`);
      }
    });

    await Promise.all(promises);
    let statusGarantia;
    if (
      notaFiscal?.itens?.some(
        (item) =>
          item.codigoStatus == GarantiasItemStatusEnum2.ENVIO_NF_DEV_AUTORIZADO
      )
    )
      statusGarantia = GarantiasStatusEnum.AGUARDANDO_NF_DEVOLUCAO;
    else statusGarantia = GarantiasStatusEnum.RECUSADA;

    const garantia: GarantiasModel = {
      razaoSocial: cardData.razaoSocial,
      telefone: cardData.telefone,
      email: context.user.email,
      nf: cardData.notas[0].codigo,
      codigoRGI: cardData.codigoRGI || cardData.rgi,
      fornecedor: context.user.fullname,
      codigoStatus: cardData.codigoStatus,
      observacao: "teste",
      usuarioAtualizacao: context.user.username,
      status: cardData.status,
      dataAtualizacao: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
      frete: cardData.frete || false,
      duplicata: cardData.duplicata || "",
      transportadora: cardData.frete ? cardData.transportadora : "",
    };


    const responseHeader = await api.put(
      `/garantias/garantiasHeader/${cardData.id}/UpdateHeader`,
      garantia
    );


    if (responseHeader.status === 200) {
      message.success("Garantia atualizada com sucesso!");
      navigate(`/garantias/technical-and-supervisor/${cardData.id}`, {
        state: { item: garantia, garantia: cardData },
      });
    }

    // Recarregar os dados do backend para atualizar os status na interface
    await fetchItems();
  };

  const updateItemDefect = (itemId: string, newDefect: string) => {
    if (cardData) {
      const updatedItems = notaFiscal?.itens?.map((item) =>
        item.id === itemId ? { ...item, tipoDefeito: newDefect } : item
      );
      setCardData({ ...cardData, itens: updatedItems });
    }
  };

  if (loading || !items || !cardData || !notaFiscal) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Spin
          size="large"
          style={{
            color: "red",
            filter: "hue-rotate(0deg) saturate(100%) brightness(0.5)",
          }}
        />
      </div>
    );
  }

  return (
    <div className={styles.containerApp} style={{ backgroundColor: "#ffffff" }}>
      <div className={styles.ContainerButtonBack}>
        <Button
          style={{ color: "grey" }}
          type="link"
          className={styles.ButtonBack}
          onClick={() =>
            navigate(`/garantias/technical-and-supervisor/${cardData.id}`, {
              state: {
                item: cardData.notas[0].itens[0],
                garantia: cardData,
              },
            })
          }
        >
          <LeftOutlined /> VOLTAR PARA INFORMAÇÕES DA RGI
        </Button>
        <span className={styles.RgiCode}>
          RGI N° {location.state.nota.codigoRGI || location.state.nota.rgi}
        </span>
      </div>

      <div className={styles.ContainerHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.tituloRgi}>NF {location.state.nf}</h1>
          <div
            style={{
              color: StatusColors[cardData?.codigoStatus],
              backgroundColor: `${StatusColors[cardData?.codigoStatus]}26`,
            }}
            className={styles.statusTag}
          >
            {cardData?.status || "Carregando..."}
          </div>
        </div>
        <div className={styles.botoesCabecalho}>
          {cardData?.codigoStatus != GarantiasStatusEnum2.NAO_ENVIADO && (
            <>
              <>
                <Button
                  type="default"
                  className={styles.ButtonDelete}
                  onClick={() =>
                    navigate("/view-pre-invoice", {
                      state: { cardData, notaFiscal },
                    })
                  }
                >
                  Visualizar Pré-Nota
                </Button>
                {/* <Button
                    type="primary"
                    className={styles.ButonToSend}
                    onClick={handleSave}
                  >
                    Salvar
                  </Button> */}
              </>
            </>
          )}
        </div>
      </div>
      <hr className={styles.divisor} />
      <FileAttachment
        label="Anexo NF de compra com IMAs"
        backgroundColor="#f5f5f5"
        isRessarcimento={false}
        itemId={notaFiscal?.id}
      />
      {(cardData.codigoStatus ===
        GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO || cardData.codigoStatus ===
        GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA || cardData.codigoStatus ===
        GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO || cardData.codigoStatus ===
        GarantiasStatusEnum2.CONFIRMADA || cardData.codigoStatus ===
        GarantiasStatusEnum2.PECAS_AVALIADAS || cardData.codigoStatus ===
        GarantiasStatusEnum2.CREDITO_CONCEDIDO) &&
        notaFiscal.itens.some((x) => x.codigoStatus == GarantiasItemStatusEnum2.ENVIO_AUTORIZADO ||
          x.codigoStatus == GarantiasItemStatusEnum2.ENVIO_NF_DEV_AUTORIZADO ||
          x.codigoStatus == GarantiasItemStatusEnum2.AUTORIZADO ||
          x.codigoStatus == GarantiasItemStatusEnum2.NAO_AUTORIZADO) && (
          <>
            <FileAttachmentDevolucao
              label="Anexo da NF de devolução"
              backgroundColor="#f5f5f5"
              garantiaId={notaFiscal?.id || ""}
              recGarantia={cardData}
            />
            <div className={styles.TitleItens}>
              <h3 className={styles.nfsTitle}>
                Itens desta NF associados a esta garantia
              </h3>
            </div>
          </>
        )}

      {notaFiscal.itens.sort((a, b) =>
        parseInt(a.codigoItem.split(".").pop() || "0") -
        parseInt(b.codigoItem.split(".").pop() || "0")
      ).map((item) => (
        <div
          className={styles.containerInformacoes}
          style={{
            border: isContentVisible[item.id] ? "1px solid red" : "none",
            borderRadius: "15px",
            padding: isContentVisible[item.id] ? "20px" : "15px",
          }}
          key={item.id}
        >
          <CollapsibleSection
            title={item.codigoItem || ""}
            isVisible={isContentVisible[item.id] || false}
            toggleVisibility={() => toggleContentVisibility(item.id)}
            handleConfirm={handleConfirm}
            statusGarantia={item.status || "Não analisado"}
          >
            <h3 className={styles.tituloSecao}>Informações Gerais</h3>
            <div className={styles.inputsContainer}>
              <div className={styles.inputsConjun}>
                <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                  <OutlinedInputWithLabel
                    label="Código da peça"
                    value={item?.codigoPeca || ""}
                    fullWidth
                    disabled
                  />
                </div>
                <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                  <OutlinedInputWithLabel
                    label="Referência / Lote da Peça"
                    value={item.loteItem || ""}
                    fullWidth
                    disabled
                  />
                </div>
              </div>

              <div className={styles.inputsConjun}>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <OutlinedInputWithLabel
                    label="Modelo do veículo que aplicou"
                    fullWidth
                    disabled
                    value={item.modeloVeiculoAplicado || ""}
                  />
                </div>
                <div className={styles.inputGroup} style={{ flex: 0.3 }}>
                  <OutlinedInputWithLabel
                    label="Ano do veículo"
                    disabled
                    value={item.anoVeiculo || ""}
                    fullWidth
                  />
                </div>
              </div>
              <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                <OutlinedInputWithLabel
                  label="Defeito"
                  value={item?.tipoDefeito || ""}
                  fullWidth
                  disabled
                />
              </div>
              {context.user.rule.name === UserRoleEnum.Supervisor && (
                <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                  <OutlinedInputWithLabel
                    label="Defeito Oficial"
                    value={item?.tipoDefeitoOficial?.replace(/_/g, " ") || ""}
                    fullWidth
                    disabled
                  />
                </div>
              )}
              <div className={styles.inputsConjun}>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <OutlinedInputWithLabel
                    label="Torque aplicado à peça"
                    value={item?.torqueAplicado?.toString() || ""}
                    fullWidth
                    disabled
                  />
                </div>
              </div>
            </div>

            <FileAttachment
              label="Anexo da NF de venda"
              backgroundColor="white"
              itemId={item?.id}
              isRessarcimento={item?.solicitarRessarcimento || false}
            />
            {item.solicitarRessarcimento &&
              context.user.rule.name !== UserRoleEnum.Supervisor && (
                <div className={styles.contentReimbursement}>
                  <h3 className={styles.tituloA}>
                    Anexo de dados adicionais para ressarcimento
                  </h3>
                  {[
                    "1. Documento de identificação (RG ou CNH):",
                    "2. Documentação do veículo:",
                    "3. NFs de serviço:",
                    "4. NF de outras despesa/produtos pertinentes:",
                  ].map((itemRes, index) => (
                    <FileAttachment
                      key={index}
                      label={itemRes}
                      itemId={item.id}
                      backgroundColor="#f5f5f5"
                      isRessarcimento={item.solicitarRessarcimento}
                    />
                  ))}
                </div>
              )}

            {context.user.rule.name !== UserRoleEnum.Supervisor && (
              <>
                <h3 className={styles.tituloA}>Anexos de Imagens</h3>
                {[
                  "1. Foto do lado onde está a gravação IMA:",
                  "2. Foto da parte danificada/amassada/quebrada:",
                  "3. Foto marcações suspeitas na peça:",
                  "4. Foto da peça completa:",
                  "5. Outras fotos pertinentes:",
                ].map((itemQuestion, index) => (
                  <FileAttachment
                    key={index}
                    label={itemQuestion}
                    backgroundColor="white"
                    itemId={item.id}
                    isRessarcimento={false}
                  />
                ))}
              </>
            )}
          </CollapsibleSection>
          {context.user.rule.name !== UserRoleEnum.Supervisor &&
            cardData.codigoStatus == GarantiasStatusEnum2.EM_ANALISE &&
            item.codigoStatus == GarantiasItemStatusEnum2.NAO_ANALISADO && (
              <>
                <div className="ButtonHeader">
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Button
                      onClick={() => {
                        item.status =
                          GarantiasItemStatusEnum.ENVIO_NAO_AUTORIZADO;
                        item.codigoStatus =
                          GarantiasItemStatusEnum2.ENVIO_NAO_AUTORIZADO;
                        handleInputChange(
                          item.id,
                          "statusItem",
                          "Envio não autorizado"
                        );
                      }}
                      type="primary"
                      className={styles.buttonSendRgi}
                    >
                      Recusar Envio
                    </Button>
                    <Button
                      type="primary"
                      className={styles.buttonSendRgi}
                      onClick={() => {
                        item.status = GarantiasItemStatusEnum.ENVIO_AUTORIZADO;
                        item.codigoStatus =
                          GarantiasItemStatusEnum2.ENVIO_AUTORIZADO;

                        handleInputChange(
                          item.id,
                          "statusItem",
                          "Envio autorizado"
                        );
                      }}
                    >
                      Autorizar Envio
                    </Button>
                  </div>
                </div>
              </>
            )}
          {context.user.rule.name == UserRoleEnum.Supervisor &&
            cardData.codigoStatus ==
            GarantiasStatusEnum2.EM_ANALISE_SUPERVISOR &&
            item.codigoStatus !=
            GarantiasItemStatusEnum2.ENVIO_NF_DEV_AUTORIZADO &&
            item.codigoStatus !=
            GarantiasItemStatusEnum2.ENVIO_NF_DEV_NAO_AUTORIZADO && (
              <>
                <div className="ButtonHeader">
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Button
                      onClick={() => {
                        item.status =
                          GarantiasItemStatusEnum.ENVIO_NF_DEV_NAO_AUTORIZADO;
                        item.codigoStatus =
                          GarantiasItemStatusEnum2.ENVIO_NF_DEV_NAO_AUTORIZADO;

                        // console.log("SATS: ", item.status);
                        handleInputChange(
                          item.id,
                          "statusItem",
                          "Envio nf de devolução não autorizado"
                        );
                      }}
                      type="primary"
                      className={styles.buttonSendRgi}
                    >
                      Recusar Envio NF Devolução
                    </Button>
                    <Button
                      type="primary"
                      className={styles.buttonSendRgi}
                      onClick={() => {
                        item.status =
                          GarantiasItemStatusEnum.ENVIO_NF_DEV_AUTORIZADO;
                        item.codigoStatus =
                          GarantiasItemStatusEnum2.ENVIO_NF_DEV_AUTORIZADO;

                        handleInputChange(
                          item.id,
                          "statusItem",
                          "Envio nf de devolução autorizado"
                        );
                      }}
                    >
                      Autorizar Envio NF Devolução
                    </Button>
                  </div>
                </div>
              </>
            )}
          {context.user.rule.name !== UserRoleEnum.Supervisor &&
            (cardData.codigoStatus == GarantiasStatusEnum2.CONFIRMADA
              || cardData.codigoStatus == GarantiasStatusEnum2.PECAS_AVALIADAS
              || cardData.codigoStatus == GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE
            ) && (
              <>
                <div className={styles.containerSelect}>
                  <OutlinedSelectWithLabel
                    label="Análise"
                    options={[
                      {
                        value: "Autorizado",
                        label: "Procedente",
                      },
                      { value: "Não autorizado", label: "Improcedente" },
                    ]}
                    value={item?.status}
                    onChange={(e) => {
                      item.status =
                        e.target.value === "Autorizado"
                          ? GarantiasItemStatusEnum.AUTORIZADO
                          : GarantiasItemStatusEnum.NAO_AUTORIZADO;
                      item.codigoStatus =
                        e.target.value === "Autorizado"
                          ? GarantiasItemStatusEnum2.AUTORIZADO
                          : GarantiasItemStatusEnum2.NAO_AUTORIZADO;

                      // console.log("SATS: ", item.status);
                      handleInputChange(item.id, "statusItem", e.target.value);
                    }}
                  />
                </div>
                <div className={styles.containerSelectDefect}>
                  <OutlinedSelectWithLabel
                    placeholder="Selecione um defeito"
                    label="Defeito"
                    options={defects.filter(x => {
                      if (item.status == GarantiasItemStatusEnum.NAO_AUTORIZADO) return x.defeito.startsWith("I")
                      else if (item.status == GarantiasItemStatusEnum.AUTORIZADO) return x.defeito.startsWith("P")
                    }).map((defect) => ({
                      label: defect.defeito, // O nome do defeito
                      value: defect.defeito, // O id do tipo defeito
                    }))}
                    value={item.tipoDefeitoOficial || ""}
                    defaultValue=""
                    onChange={(e) => {
                      item.tipoDefeitoOficial = e.target.value;
                      updateItemDefect(item.id, e.target.value);
                    }}
                  />
                </div>
                {item.status == GarantiasItemStatusEnum.NAO_AUTORIZADO && (
                  <>
                    <h3 className={styles.tituloA}>Análise técnica</h3>
                    <QuillItemEditor
                      itemId={item.id}
                      value={item.analiseTecnica || ""}
                      onChangeHtml={(html) => {
                        item.analiseTecnica = html;
                        handleInputChange(item.id, "analiseTecnicaHtml", html);
                      }}
                      onUploadMapped={(localSrc, remoteUrl) => addImageMapping(item.id, localSrc, remoteUrl)}
                    />

                    <h3 className={styles.tituloA}>Conclusão</h3>
                    <MultilineTextFields
                      value={item?.conclusao || ""}
                      onChange={(e) => {
                        item.conclusao = e.target.value;
                        setConclusao(e.target.value);
                      }}
                      label="Conclusão"
                      placeholder="Digite a conclusão aqui..."
                    />
                  </>
                )}
              </>
            )}
          {context.user.rule.name == UserRoleEnum.Supervisor &&
            (
              cardData.codigoStatus == GarantiasStatusEnum2.PECAS_AVALIADAS ||
              cardData.codigoStatus == GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE
            ) && (
              <>
                {item.status == GarantiasItemStatusEnum.NAO_AUTORIZADO && (
                  <>
                    <h3 className={styles.tituloA}>Conclusão</h3>
                    <MultilineTextFields
                      disabled
                      value={item?.conclusao || ""}
                      onChange={null}
                      label="Conclusão"
                    />
                  </>
                )}

                {item.status == GarantiasItemStatusEnum.AUTORIZADO && (
                  <>
                    <h3 className={styles.tituloA}>Conclusão</h3>
                    <OutlinedSelectWithLabel
                      label="Defeito"
                      options={[
                        { label: item?.tipoDefeitoOficial, value: item?.tipoDefeitoOficial }
                      ]}
                      value={item?.tipoDefeitoOficial || ""}
                      defaultValue=""
                      disabled
                      onChange={null}
                    />
                  </>
                )}
              </>
            )
          }


        </div>
      ))}
      <div className={styles.botoesCabecalho}>
        {(cardData.codigoStatus === GarantiasStatusEnum2.EM_ANALISE ||
          cardData.codigoStatus === GarantiasStatusEnum2.CONFIRMADA) && (
            <>
              {context.user.rule.name === UserRoleEnum.Tecnico && (
                <>
                  <Button
                    type="primary"
                    className={styles.ButonToSend}
                    onClick={handleSave}
                  >
                    Salvar
                  </Button>
                </>
              )}
            </>
          )}
        {cardData.codigoStatus ===
          GarantiasStatusEnum2.EM_ANALISE_SUPERVISOR && (
            <>
              {context.user.rule.name === UserRoleEnum.Supervisor && (
                <>
                  <Button
                    type="primary"
                    className={styles.ButonToSend}
                    onClick={handleSaveNFDev}
                  >
                    Salvar
                  </Button>
                </>
              )}
            </>
          )}
      </div>
    </div>
  );
};

export default TechnicalAndSupervisorDetailsItens;
