import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { Html } from "react-pdf-html";
import logoBase64 from "../../../../assets/image/png/logo-ima.png";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Helvetica",
    lineHeight: 1.6,
    color: "#333",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: {
    textAlign: "center",
    fontSize: 16,
  },
  logo: {
    width: 100,
    height: 50,
  },
  dateField: {
    width: "15%",
  },
  dateInput: {
    fontSize: 10,
    border: "1px solid #dadada",
    padding: "5px 10px",
    borderRadius: 5,
  },
  dateLabel: {
    fontSize: 8,
    backgroundColor: "white",
    paddingHorizontal: 5,
    marginLeft: 10,
    marginBottom: 2,
  },
  section: {
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    border: "1px solid #dadada",
    padding: "20px 25px",
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 15,
  },
  inputGroup: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  inputField: {
    marginBottom: 15,
    marginHorizontal: 5,
    flexDirection: "column",
  },
  inputLabel: {
    fontSize: 10,
    backgroundColor: "white",
    paddingHorizontal: 5,
    marginBottom: 2,
  },
  input: {
    width: "100%",
    height: 30,
    borderRadius: 5,
    fontSize: 10,
    padding: "0 15px",
    border: "1px solid #dadada",
    color: "#000000",
  },
  editorContent: {
    fontSize: 10,
  },
  boldText: {
    fontFamily: "Helvetica",
    fontWeight: "bold",
  },
  italicText: {
    fontFamily: "Helvetica",
    fontStyle: "italic",
  },
  imageContainer: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  analysisImage: {
    width: 150,
    height: 100,
    marginRight: 10,
    marginBottom: 10,
  },
});

export type Item = {
  codigo: string;
  lote: string;
  modelo: string;
  ano: string;
  torque?: string;
  status: string;
  images?: Blob[];
  conclusao: string;
  razaoSocial: string;
  cnpj: string;
  telefone: string;
  email: string;
  defeito: string;
  aroVeiculo: string;
  analiseTecnica: string;
  dataEmissao: string;
};

type PDFProps = { item: Item; images?: string[] };

const ReportPDF: React.FC<PDFProps> = ({ item, images = [] }) => {
  // console.log("HTML que chegou no ReportPDF:", item.analiseTecnica);
  // console.log("images.length:", images.length);

  const safeText = (text: string | undefined) => text || "";

  function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  const imageChunks = chunkArray(images, 4);

  return (
    <Document>
      {/* ===== PÁGINA 1: Cabeçalho + Dados do Cliente e Peça ===== */}
      <Page size="A4" style={styles.page}>
        {/* Header with logo, title and date */}
        <View style={styles.header}>
          <Image src={logoBase64} style={styles.logo} />
          <Text style={styles.headerTitle}>
            Laudo Técnico de Solicitação de Garantia
          </Text>
          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>Data de Emissão</Text>
            <Text style={styles.dateInput}>{item.dataEmissao}</Text>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Cliente</Text>

          <View style={styles.inputGroup}>
            <View style={[styles.inputField, { width: "50%" }]}>
              <Text style={styles.inputLabel}>Razão Social</Text>
              <Text style={styles.input}>
                {safeText(item?.razaoSocial) || "Razão Social Não Informada"}
              </Text>
            </View>
            <View style={[styles.inputField, { width: "50%" }]}>
              <Text style={styles.inputLabel}>CNPJ</Text>
              <Text style={styles.input}>
                CNPJ: {safeText(item?.cnpj) || "CNPJ Não Informado"}
              </Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={[styles.inputField, { width: "33%" }]}>
              <Text style={styles.inputLabel}>Telefone</Text>
              <Text style={styles.input}>{safeText(item?.telefone)}</Text>
            </View>
            <View style={[styles.inputField, { width: "33%" }]}>
              <Text style={styles.inputLabel}>E-mail</Text>
              <Text style={styles.input}>{safeText(item?.email)}</Text>
            </View>
          </View>
        </View>

        {/* Part Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações da Peça</Text>

          <View style={styles.inputGroup}>
            <View style={[styles.inputField, { width: "50%" }]}>
              <Text style={styles.inputLabel}>Código da peça *</Text>
              <Text style={styles.input}>
                {safeText(item?.codigo) || "ALR-84888"}
              </Text>
            </View>
            <View style={[styles.inputField, { width: "50%" }]}>
              <Text style={styles.inputLabel}>Referência / Lote da Peça *</Text>
              <Text style={styles.input}>{safeText(item?.lote) || "2547A"}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={[styles.inputField, { width: "33%" }]}>
              <Text style={styles.inputLabel}>Possível defeito *</Text>
              <Text style={styles.input}>{safeText(item?.defeito)}</Text>
            </View>
            <View style={[styles.inputField, { width: "33%" }]}>
              <Text style={styles.inputLabel}>
                Modelo do veículo que aplicou *
              </Text>
              <Text style={styles.input}>
                {safeText(item?.modelo) || "Modelo X"}
              </Text>
            </View>
            <View style={[styles.inputField, { width: "33%" }]}>
              <Text style={styles.inputLabel}>Aro do veículo *</Text>
              <Text style={styles.input}>
                {safeText(item?.aroVeiculo) || "Modelo X"}
              </Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={[styles.inputField, { width: "50%" }]}>
              <Text style={styles.inputLabel}>Torque aplicado na peça</Text>
              <Text style={styles.input}>{safeText(item?.torque)}</Text>
            </View>
            <View style={[styles.inputField, { width: "50%" }]}>
              <Text style={styles.inputLabel}>Status de Autorização</Text>
              <Text style={styles.input}>{safeText(item.status)}</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* ===== PÁGINA 2+: Análise Técnica Visual com imagens paginadas ===== */}
      {imageChunks.length === 0 ? (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Análise Técnica Visual</Text>

            <View style={styles.editorContent}>
              {item.analiseTecnica ? (
                <Html style={{ fontSize: 10 }}>
                  {item.analiseTecnica.replace(/<img[^>]*>/g, "")}
                </Html>
              ) : (
                <Text>Nenhuma análise técnica informada.</Text>
              )}
            </View>
          </View>

          {/* Conclusão */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conclusão</Text>
            <View style={styles.editorContent}>
              <Text>{item.conclusao || "Conclusão padrão..."}</Text>
            </View>
          </View>
        </Page>
      ) : (
        imageChunks.map((chunk, pageIdx) => (
          <Page key={pageIdx} size="A4" style={styles.page}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Análise Técnica Visual
                {pageIdx > 0 ? ` (continuação ${pageIdx})` : ""}
              </Text>

              {pageIdx === 0 && (
                <View style={styles.editorContent}>
                  {item.analiseTecnica ? (
                    <Html style={{ fontSize: 10 }}>
                      {item.analiseTecnica.replace(/<img[^>]*>/g, "")}
                    </Html>
                  ) : (
                    <Text>Nenhuma análise técnica informada.</Text>
                  )}
                </View>
              )}

              <View style={styles.imageContainer}>
                {chunk.map((src, idx) => (
                  <Image
                    key={`${pageIdx}-${idx}`}
                    src={src}
                    style={styles.analysisImage}
                  />
                ))}
              </View>
            </View>
          </Page>
        ))
      )}

      {/* ===== PÁGINA FINAL: Conclusão (só se houver imagens) ===== */}
      {imageChunks.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conclusão</Text>
            <View style={styles.editorContent}>
              <Text>{item.conclusao || "Conclusão padrão..."}</Text>
            </View>
          </View>
        </Page>
      )}
    </Document>
  );
};

export default ReportPDF;
