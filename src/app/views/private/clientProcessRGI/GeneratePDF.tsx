import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import logoBase64 from "../../../../assets/image/png/logo-ima.png"; // Se estiver usando Vite, Webpack com file-loader ou asset modules

// Não é necessário registrar Helvetica - é a fonte padrão do PDF
// Mas podemos definir estilos com ela
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
    flexDirection: "column", // Coloca o label em cima do campo
  },
  inputLabel: {
    fontSize: 10,
    backgroundColor: "white",
    paddingHorizontal: 5,
    marginBottom: 2, // Adiciona espaço abaixo do label
  },
  input: {
    width: "100%",
    height: 30,
    borderRadius: 5,
    fontSize: 10,
    padding: "0 15px",
    border: "1px solid #dadada",
    color: "#000000", // Garante que o texto seja preto
  },
  editorContent: {
    fontSize: 10,
  },
  boldText: {
    fontFamily: "Helvetica", // Fallback para negrito
    fontWeight: "bold", // Duplo fallback
  },
  italicText: {
    fontFamily: "Helvetica",
    fontStyle: "italic",
  },
  imageContainer: {
    marginTop: 10,
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

type PDFProps = { item: Item };

// Adiciona esta função para garantir o carregament

const ReportPDF: React.FC<PDFProps> = ({ item }) => {
  const safeText = (text: string | undefined) => text || "";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with logo, title and date */}
        <View style={styles.header}>
          <Image
            src={logoBase64}
            style={styles.logo}
          />
          <Text style={styles.headerTitle}>
            Laudo Técnico de Solicitação de Garantia
          </Text>
          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>Data de Emissão</Text>
            <Text style={styles.dateInput}>
              {new Date(safeText(item.dataEmissao)).toLocaleDateString() || "00/00/0000"}
            </Text>
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
              <Text style={styles.input}>{safeText(item?.codigo) || "ALR-84888"}</Text>
            </View>
            <View style={[styles.inputField, { width: "50%" }]}>
              <Text style={styles.inputLabel}>Lote da peça *</Text>
              <Text style={styles.input}>{safeText(item?.lote) || "2547A"}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={[styles.inputField, { width: "33%" }]}>
              <Text style={styles.inputLabel}>Possível defeito *</Text>
              <Text style={styles.input}>{safeText(item?.defeito) || "Opção 1"}</Text>
            </View>
            <View style={[styles.inputField, { width: "33%" }]}>
              <Text style={styles.inputLabel}>
                Modelo do veículo que aplicou *
              </Text>
              <Text style={styles.input}>{safeText(item?.modelo) || "Modelo X"}</Text>
            </View>
            <View style={[styles.inputField, { width: "33%" }]}>
              <Text style={styles.inputLabel}>Aro do veículo *</Text>
              <Text style={styles.input}>{safeText(item?.aroVeiculo) || "Modelo X"}</Text>
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

        {/* Technical Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Análise Técnica Visual</Text>
          <View style={styles.editorContent}>
            {item.images && item.images.length > 0 && (
              <View style={styles.imageContainer}>
                {item.images.map((imageBlob, index) => (
                  <Image
                    key={index}
                    src={URL.createObjectURL(imageBlob)}
                    style={styles.analysisImage}
                  />
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Conclusion */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conclusão</Text>
          <View style={styles.editorContent}>
            <Text>{item.conclusao || "Conclusão padrão..."}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ReportPDF;
