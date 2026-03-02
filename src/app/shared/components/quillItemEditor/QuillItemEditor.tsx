import React, { useContext, useMemo, useRef } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import environment from "@env/environment.ts";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import QuillImageDropAndPaste from "quill-image-drop-and-paste";
import ImageResize from "quill-image-resize-module-react";

Quill.register("modules/imageDropAndPaste", QuillImageDropAndPaste);
Quill.register("modules/imageResize", ImageResize);

type Props = {
    itemId: string;
    value: string;
    disabled?: boolean;
    onChangeHtml: (html: string) => void;
    onUploadMapped: (localSrc: string, remoteUrl: string) => void;
};

export const QuillItemEditor: React.FC<Props> = ({
    itemId,
    value,
    disabled,
    onChangeHtml,
    onUploadMapped,
}) => {
    const quillRef = useRef<ReactQuill | null>(null);
    const context = useContext(AuthContext);

    const uploadFile = async (file: File): Promise<string | null> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("itemId", itemId);
        formData.append("field", "technicalAnalyse");

        const response = await fetch(
            `${environment.apiUrl}/files/upload-private-file-item-technical-analyse`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${context.user.token}`,
                    accept: "*/*",
                },
                body: formData,
            }
        );

        if (!response.ok) return null;

        const data = await response.json(); // { url: "undefined/..."}
        let url = data?.url as string | undefined;
        if (!url) return null;

        // corrige o undefined e base duplicada
        const idx = url.indexOf("/files");
        if (idx !== -1) {
            const base = environment.apiUrl.replace(/\/+$/, "");
            const path = url.substring(idx).replace(/^\/+/, "");
            url = `${base}/${path}`;
        }

        return url;
    };

    const imageHandler = async () => {
        const editor = quillRef.current?.getEditor();
        if (!editor) return;

        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            // 1) preview local
            const reader = new FileReader();
            reader.onload = async () => {
                const localSrc = String(reader.result); // dataUrl

                const range = editor.getSelection(true);
                const index = range?.index ?? editor.getLength();
                editor.insertEmbed(index, "image", localSrc, "user");

                // 2) upload em paralelo
                const remoteUrl = await uploadFile(file);
                if (remoteUrl) {
                    onUploadMapped(localSrc, remoteUrl);
                }
            };
            reader.readAsDataURL(file);
        };
    };

    const modules = useMemo(
        () => ({
            toolbar: {
                container: [
                    [{ font: [] }, { size: [] }],
                    [{ header: [1, 2, 3, 4, 5, 6, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ color: [] }, { background: [] }],
                    [{ script: "sub" }, { script: "super" }],
                    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
                    [{ align: [] }],
                    ["blockquote", "code-block"],
                    ["link", "image"],
                    ["clean"],
                ],
                handlers: {
                    image: imageHandler,
                },
            },
            imageDropAndPaste: {
                handler: async (dataUrl: string) => {
                    const editor = quillRef.current?.getEditor();
                    if (!editor) return;

                    // 1) preview dataUrl
                    let index = (editor.getSelection() || {}).index;
                    if (index === undefined || index < 0) index = editor.getLength();
                    editor.insertEmbed(index, "image", dataUrl, "user");

                    // 2) upload
                    const res = await fetch(dataUrl);
                    const blob = await res.blob();
                    const file = new File([blob], "pasted-image.png", { type: blob.type });

                    const remoteUrl = await uploadFile(file);
                    if (remoteUrl) {
                        onUploadMapped(dataUrl, remoteUrl);
                    }
                },
            },
            imageResize: {
                modules: ["Resize", "DisplaySize"],
            },
        }),
        [itemId]
    );

    const formats = [
        "font",
        "size",
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "color",
        "background",
        "script",
        "list",
        "bullet",
        "indent",
        "align",
        "blockquote",
        "code-block",
        "link",
        "image",
    ];

    return (
        <div style={{ marginTop: 12 }}>
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value || ""}
                onChange={onChangeHtml}
                modules={modules}
                formats={formats}
                readOnly={!!disabled}
            />
        </div>
    );
};
