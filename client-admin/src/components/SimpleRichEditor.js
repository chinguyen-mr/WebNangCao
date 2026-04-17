import React, { Component } from 'react';

/**
 * SimpleRichEditor - A lightweight, zero-dependency rich text editor
 * Compatible with React 19. Uses contentEditable + execCommand.
 */
class SimpleRichEditor extends Component {
  constructor(props) {
    super(props);
    this.editorRef = React.createRef();
    this.isInternalChange = false;
    this.lastValue = '';
  }

  componentDidMount() {
    if (this.editorRef.current && this.props.value) {
      this.editorRef.current.innerHTML = this.props.value;
      this.lastValue = this.props.value;
    }
  }

  componentDidUpdate(prevProps) {
    // Only update DOM when value prop changes from outside AND editor is not focused
    if (prevProps.value !== this.props.value && !this.isInternalChange) {
      if (this.editorRef.current && document.activeElement !== this.editorRef.current) {
        this.editorRef.current.innerHTML = this.props.value || '';
        this.lastValue = this.props.value || '';
      }
    }
    this.isInternalChange = false;
  }

  execCmd = (command, value = null) => {
    document.execCommand(command, false, value);
    this.emitChange();
    this.editorRef.current?.focus();
  };

  emitChange = () => {
    if (this.props.onChange && this.editorRef.current) {
      const html = this.editorRef.current.innerHTML;
      if (html !== this.lastValue) {
        this.isInternalChange = true;
        this.lastValue = html;
        this.props.onChange(html);
      }
    }
  };

  insertImage = () => {
    const url = prompt('Nhập URL hình ảnh:');
    if (url) {
      this.execCmd('insertImage', url);
    }
  };

  insertLink = () => {
    const url = prompt('Nhập URL liên kết:');
    if (url) {
      this.execCmd('createLink', url);
    }
  };

  render() {
    const { disabled } = this.props;

    const toolbarStyle = {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px',
      padding: '8px 10px',
      background: '#f5f0eb',
      borderBottom: '1px solid #d4c9bc',
      borderRadius: '8px 8px 0 0',
    };

    const btnStyle = {
      background: 'white',
      border: '1px solid #c9bfb2',
      borderRadius: '4px',
      padding: '5px 10px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: '13px',
      color: '#4B3621',
      transition: 'all 0.15s ease',
      minWidth: '32px',
      opacity: disabled ? 0.5 : 1,
    };

    const selectStyle = {
      ...btnStyle,
      padding: '5px 6px',
    };

    const editorStyle = {
      minHeight: '250px',
      padding: '16px',
      borderTop: 'none',
      borderRadius: '0 0 8px 8px',
      outline: 'none',
      lineHeight: '1.7',
      fontSize: '14px',
      color: '#333',
      background: 'white',
      overflowY: 'auto',
      maxHeight: '400px',
    };

    const separatorStyle = {
      width: '1px',
      height: '24px',
      background: '#d4c9bc',
      margin: '0 4px',
      alignSelf: 'center',
    };

    return (
      <div style={{ border: '1px solid #d4c9bc', borderRadius: '8px', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={toolbarStyle}>
          <select
            style={selectStyle}
            onChange={(e) => this.execCmd('fontSize', e.target.value)}
            defaultValue="3"
            disabled={disabled}
            title="Cỡ chữ"
          >
            <option value="1">Rất nhỏ</option>
            <option value="2">Nhỏ</option>
            <option value="3">Bình thường</option>
            <option value="4">Lớn</option>
            <option value="5">Rất lớn</option>
            <option value="6">Tiêu đề</option>
            <option value="7">Tiêu đề lớn</option>
          </select>

          <div style={separatorStyle} />

          <button type="button" style={{...btnStyle, fontWeight: 'bold'}} onClick={() => this.execCmd('bold')} disabled={disabled} title="In đậm">B</button>
          <button type="button" style={{...btnStyle, fontStyle: 'italic'}} onClick={() => this.execCmd('italic')} disabled={disabled} title="In nghiêng">I</button>
          <button type="button" style={{...btnStyle, textDecoration: 'underline'}} onClick={() => this.execCmd('underline')} disabled={disabled} title="Gạch chân">U</button>
          <button type="button" style={{...btnStyle, textDecoration: 'line-through'}} onClick={() => this.execCmd('strikeThrough')} disabled={disabled} title="Gạch ngang">S</button>

          <div style={separatorStyle} />

          <label style={{...btnStyle, position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '4px'}} title="Màu chữ">
            🎨 Màu
            <input
              type="color"
              defaultValue="#4B3621"
              onChange={(e) => this.execCmd('foreColor', e.target.value)}
              style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', left: 0, top: 0 }}
              disabled={disabled}
            />
          </label>

          <label style={{...btnStyle, position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '4px'}} title="Màu nền">
            🖌️ Nền
            <input
              type="color"
              defaultValue="#FFFFFF"
              onChange={(e) => this.execCmd('hiliteColor', e.target.value)}
              style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', left: 0, top: 0 }}
              disabled={disabled}
            />
          </label>

          <div style={separatorStyle} />

          <button type="button" style={btnStyle} onClick={() => this.execCmd('justifyLeft')} disabled={disabled} title="Căn trái">⬅</button>
          <button type="button" style={btnStyle} onClick={() => this.execCmd('justifyCenter')} disabled={disabled} title="Căn giữa">⬛</button>
          <button type="button" style={btnStyle} onClick={() => this.execCmd('justifyRight')} disabled={disabled} title="Căn phải">➡</button>

          <div style={separatorStyle} />

          <button type="button" style={btnStyle} onClick={() => this.execCmd('insertUnorderedList')} disabled={disabled} title="Danh sách">• ≡</button>
          <button type="button" style={btnStyle} onClick={() => this.execCmd('insertOrderedList')} disabled={disabled} title="Danh sách số">1. ≡</button>

          <div style={separatorStyle} />

          <button type="button" style={btnStyle} onClick={this.insertImage} disabled={disabled} title="Chèn ảnh">📷 Ảnh</button>
          <button type="button" style={btnStyle} onClick={this.insertLink} disabled={disabled} title="Chèn liên kết">🔗 Link</button>

          <div style={separatorStyle} />

          <button type="button" style={btnStyle} onClick={() => this.execCmd('removeFormat')} disabled={disabled} title="Xóa định dạng">✖ Xóa</button>
        </div>

        {/* Editor Area */}
        <div
          ref={this.editorRef}
          contentEditable={!disabled}
          onInput={this.emitChange}
          onBlur={this.emitChange}
          style={editorStyle}
          suppressContentEditableWarning={true}
        />
      </div>
    );
  }
}

export default SimpleRichEditor;
