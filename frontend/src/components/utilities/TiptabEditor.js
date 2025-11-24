import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import {
  Box,
  IconButton,
  Paper,
  Divider,
  ButtonGroup,
  Popover,
  Grid,
  Typography,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  StrikethroughS as FormatStrikethrough,
  Code,
  FormatClear,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  FormatListBulleted,
  FormatListNumbered,
  LooksOne,
  LooksTwo,
  Link as LinkIcon,
  Image as ImageIcon,
  ImageSearch,
  FormatColorText,
  FormatColorFill,
} from '@mui/icons-material';
import { ResizableImage } from 'tiptap-extension-resizable-image';

// 공용 API 유틸
import { getPresignedUpload, getFileUrl } from '../utilities/FileApi';

// ----------------------------------------------------------------------
// 색상 팔레트 및 버튼 컴포넌트
// ----------------------------------------------------------------------

const PALETTE_COLORS = [
  '#000000', '#FFFFFF', '#C00000', '#FFC000', '#FFFF00', '#92D050', '#00B050', '#00B0F0', '#0070C0', '#7030A0',
  '#444444', '#F2F2F2', '#F4CCCC', '#FFF2CC', '#FFF7A9', '#D9EAD3', '#C6E0B4', '#A2C4C9', '#9FC5E8', '#B4A7D6',
  '#666666', '#D9D9D9', '#EA9999', '#FFD966', '#FFEE7A', '#B6D7A8', '#93C47D', '#76A5AD', '#6FA8DC', '#8E7CC3',
  '#999999', '#BFBFBF', '#CC0000', '#E69138', '#F1C232', '#6AA84F', '#38761D', '#3C78D8', '#1C4587', '#5B0F76',
];

const CustomColorPopover = ({ editor, anchorEl, handleClose, attribute }) => {
  const setColor = (color) => {
    if (attribute === 'textStyle') {
      editor.chain().focus().setColor(color).run();
    } else if (attribute === 'highlight') {
      editor.chain().focus().setHighlight({ color }).run();
    }
    handleClose();
  };

  const unsetColor = () => {
    if (attribute === 'textStyle') {
      editor.chain().focus().unsetColor().run();
    } else if (attribute === 'highlight') {
      editor.chain().focus().unsetHighlight().run();
    }
    handleClose();
  };

  const title = attribute === 'textStyle' ? '텍스트 색상' : '하이라이트 색상';
  const unsetTitle = attribute === 'textStyle' ? '색상 해제' : '하이라이트 해제';

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Box sx={{ p: 1, width: 250 }}>
        <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>{title}</Typography>
        <Grid container spacing={0.5}>
          {PALETTE_COLORS.map((color) => (
            <Grid size={{xs:1.5}} key={color}>
              <IconButton
                onClick={() => setColor(color)}
                sx={{
                  width: 24, height: 24, p: 0, borderRadius: '50%',
                  backgroundColor: color,
                  border: `1px solid ${color === '#FFFFFF' ? '#ccc' : 'transparent'}`,
                  transition: 'box-shadow 0.2s',
                  '&:hover': {
                    backgroundColor: color,
                    boxShadow: `0 0 0 2px ${color}, 0 0 0 4px rgba(0,0,0,0.5)`,
                  },
                }}
                title={color}
              />
            </Grid>
          ))}
        </Grid>
        <Divider sx={{ my: 1 }} />
        <Button onClick={unsetColor} fullWidth size="small" variant="outlined" sx={{ color: 'text.primary' }}>
          {unsetTitle}
        </Button>
      </Box>
    </Popover>
  );
};

const isLightColor = (hex) => {
  if (!hex || hex.toLowerCase() === 'inherit') return false;
  const color = hex.substring(1);
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 180;
};

const ColorButton = ({ editor }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const currentColor = editor.getAttributes('textStyle').color || 'inherit';
  const needsDarkBg = currentColor.toLowerCase() === '#ffffff' || isLightColor(currentColor);

  return (
    <>
      <IconButton onClick={handleClick} disabled={!editor.isEditable} size="small" title="텍스트 색상">
        <FormatColorText
          fontSize="inherit"
          sx={{
            color: currentColor === 'inherit' ? 'text.primary' : currentColor,
            backgroundColor: needsDarkBg ? 'rgba(0,0,0,0.9)' : 'transparent',
            borderRadius: '2px',
            p: '2px',
          }}
        />
      </IconButton>
      <CustomColorPopover editor={editor} anchorEl={anchorEl} handleClose={handleClose} attribute="textStyle" />
    </>
  );
};

const HighlightButton = ({ editor }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const currentHighlightColor = editor.getAttributes('highlight').color || 'transparent';
  const isUnset = currentHighlightColor.toLowerCase() === 'transparent';
  const needsDarkBg = !isUnset && (currentHighlightColor.toLowerCase() === '#ffffff' || isLightColor(currentHighlightColor));

  return (
    <>
      <IconButton onClick={handleClick} disabled={!editor.isEditable} size="small" title="텍스트 하이라이트">
        <FormatColorFill
          fontSize="inherit"
          sx={{
            color: isUnset ? 'text.primary' : currentHighlightColor,
            backgroundColor: needsDarkBg ? 'rgba(0,0,0,0.9)' : 'transparent',
            borderRadius: '2px',
            p: '2px',
          }}
        />
      </IconButton>
      <CustomColorPopover editor={editor} anchorEl={anchorEl} handleClose={handleClose} attribute="highlight" />
    </>
  );
};

// ----------------------------------------------------------------------
// 메뉴바
// ----------------------------------------------------------------------

const MenuBar = ({ editor, onUploadedKeysChange }) => {
  if (!editor) return null;

  const addImageByUrl = async () => {
    const url = window.prompt('이미지 URL을 입력하세요');
    if (!url) return;
    // URL로 삽입 시 data-key는 없음
    editor.chain().focus().setResizableImage({ src: url }).run();
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL을 입력하세요', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleFileSelect = async (e, isImage) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isImage) {
      try {
        const { key, uploadUrl } = await getPresignedUpload(file.name, file.type);

        await import('../../api/Api-Service').then(async ({ default: apiClient }) => {
          await apiClient.put(uploadUrl, file, {
            headers: { 'Content-Type': file.type },
          });
        });

        const { url } = await getFileUrl(key);

        editor.chain().focus().setResizableImage({ src: url, 'data-key': key }).run();

        // 업로드된 key를 상위로 전달하여 추적
        onUploadedKeysChange?.((prevKeys) => {
          const next = new Set(prevKeys || []);
          next.add(key);
          return Array.from(next);
        });
      } catch (err) {
        console.error('이미지 업로드 실패:', err);
        alert('이미지 업로드에 실패했습니다.');
      }
    } else {
      const filePath = `[파일] ${file.name}`;
      editor.chain().focus().insertContent(filePath).run();
    }

    e.target.value = null;
  };

  const FileUploadButton = ({ icon: Icon, tooltip, accept, isImage }) => {
    const fileInputRef = useRef(null);
    return (
      <IconButton
        onClick={() => fileInputRef.current.click()}
        disabled={!editor.isEditable}
        size="small"
        title={tooltip}
      >
        <Icon fontSize="inherit" />
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileSelect(e, isImage)}
          accept={accept}
          style={{ display: 'none' }}
        />
      </IconButton>
    );
  };

  const TiptapButton = ({ icon: Icon, onClick, isActive, tooltip, disabled = false }) => (
    <IconButton
      onClick={onClick}
      disabled={!editor.isEditable || disabled}
      color={isActive ? 'primary' : 'default'}
      size="small"
      title={tooltip}
    >
      <Icon fontSize="inherit" />
    </IconButton>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.5,
        p: 1,
        backgroundColor: 'inherit',
        borderBottom: '1px solid',
        borderColor: 'divider',
        borderRadius: '4px 4px 0 0',
      }}
    >
      <ButtonGroup variant="text" size="small">
        <TiptapButton icon={FormatBold} onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} tooltip="볼드체" />
        <TiptapButton icon={FormatItalic} onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} tooltip="이탤릭체" />
        <TiptapButton icon={FormatUnderlined} onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} tooltip="밑줄" />
        <TiptapButton icon={FormatStrikethrough} onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} tooltip="취소선" />
      </ButtonGroup>

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      <ButtonGroup variant="text" size="small">
        <TiptapButton icon={Code} onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} tooltip="코드" />
        <ColorButton editor={editor} />
        <HighlightButton editor={editor} />
      </ButtonGroup>

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      <ButtonGroup variant="text" size="small">
        <TiptapButton icon={FormatAlignLeft} onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} tooltip="왼쪽 정렬" />
        <TiptapButton icon={FormatAlignCenter} onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} tooltip="가운데 정렬" />
        <TiptapButton icon={FormatAlignRight} onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} tooltip="오른쪽 정렬" />
        <TiptapButton icon={FormatAlignJustify} onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} tooltip="양쪽 맞춤" />
      </ButtonGroup>

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      <ButtonGroup variant="text" size="small">
        <TiptapButton icon={ImageSearch} onClick={addImageByUrl} tooltip="이미지 URL 삽입" />
        <FileUploadButton icon={ImageIcon} tooltip="로컬 이미지 선택 (업로드)" accept="image/*" isImage={true} />
        {/* <FileUploadButton icon={AttachFile} tooltip="일반 파일 첨부" accept="*" isImage={false} /> */}
      </ButtonGroup>

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      <ButtonGroup variant="text" size="small">
        <TiptapButton icon={LooksOne} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} tooltip="제목 (H1)" />
        <TiptapButton icon={LooksTwo} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} tooltip="부제목 (H2)" />
        <TiptapButton icon={FormatListBulleted} onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} tooltip="순서 없는 목록" />
        <TiptapButton icon={FormatListNumbered} onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} tooltip="순서 있는 목록" />
      </ButtonGroup>

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      <ButtonGroup variant="text" size="small">
        <TiptapButton icon={LinkIcon} onClick={setLink} isActive={editor.isActive('link')} tooltip="링크 추가/수정" />
        <TiptapButton icon={FormatClear} onClick={() => editor.chain().focus().unsetAllMarks().run()} tooltip="모든 스타일 해제" />
      </ButtonGroup>
    </Paper>
  );
};

// ----------------------------------------------------------------------
// 에디터 스타일
// ----------------------------------------------------------------------

const EditorWrapper = styled(Box)(({ theme }) => ({
  '& .ProseMirror': {
    minHeight: '400px',
    padding: theme.spacing(2),
    lineHeight: 1.5,
    '&:focus': { outline: 'none' },
    fontFamily: theme.typography.fontFamily,
    '& img': {
      maxWidth: '100%',
      height: 'auto',
      borderRadius: '4px',
      border: '2px solid transparent',
      '&.ProseMirror-selectednode': {
        border: `2px solid ${theme.palette.primary.main}`,
      },
    },
    '& mark': {
      backgroundColor: 'var(--color)',
      color: 'inherit',
      padding: '2px 0',
      borderRadius: '2px',
    },
    '& h1': {
      ...theme.typography.h4,
      fontWeight: theme.typography.fontWeightBold,
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(1),
    },
    '& h2': {
      ...theme.typography.h5,
      fontWeight: theme.typography.fontWeightBold,
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
    },
    '& p': { ...theme.typography.body1, margin: 0 },
    '& ul, ol': { paddingLeft: theme.spacing(4) },
    '& li': { ...theme.typography.body1 },
    '& a': { color: theme.palette.primary.main, textDecoration: 'underline', cursor: 'pointer' },
  },
}));

// ----------------------------------------------------------------------
// 메인 컴포넌트
// ----------------------------------------------------------------------

const TiptapEditor = ({ initialContent, onContentChange, error, onUploadedKeysChange, placeholderText }) => {

  const CustomResizableImage = ResizableImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      'data-key': {
        default: null,
        parseHTML: element => element.getAttribute('data-key'),
        renderHTML: attributes => {
          if (!attributes['data-key']) return {};
          return { 'data-key': attributes['data-key'] };
        },
      },
    };
  },
});

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: true,
        codeBlock: false,
        heading: { levels: [1, 2] },
        strike: false,
        underline: false,
        link: false,
      }),
      Underline,
      Strike,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer nofollow',
        },
      }),
      CustomResizableImage.configure({
        enabled: true,
        inline: true,
        allowBase64: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const newHtml = editor.getHTML();
      onContentChange(newHtml);
    },
    editorProps: {
      attributes: {
        class: `ProseMirror focus:outline-none`,
        'data-placeholder': placeholderText || '',
      },
    },
  });

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent, false);
    }
  }, [initialContent, editor]);

  return (
    <Box
      sx={{
        border: `1px solid black`,
        borderRadius: '4px',
        backgroundColor: 'background.paper',
        borderColor: error ? 'error.main' : 'inherit',
      }}
    >
      <MenuBar editor={editor} onUploadedKeysChange={onUploadedKeysChange} />
      <EditorWrapper>
        <EditorContent editor={editor} />
      </EditorWrapper>
    </Box>
  );
};

export default TiptapEditor;
