import { useState } from 'react';
import { useFileSystem } from '../context/FileSystemContext';
import DocumentExplorer from './DocumentExplorer';
import { 
  FolderIcon, 
  FileIcon, 
  ChevronRight, 
  ChevronDown,
  FolderOpen,
  FileText,
  FilePlus,
  FolderPlus,
  Trash2,
  Edit2,
  File
} from 'lucide-react';
import { useDndContext, DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import '../styles/FileExplorer.css';

const FileNode = ({ node, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(node.name);
  const { openFile, deleteNode, renameNode, selectedFile, selectFolder, selectedFolder } = useFileSystem();

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: node.id,
    data: { node }
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: node.id,
    disabled: node.type !== 'folder',
    data: { node }
  });

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
      selectFolder(node); // Select the folder for uploads
    } else {
      openFile(node);
    }
  };

  const handleRename = () => {
    if (newName.trim() && newName !== node.name) {
      renameNode(node.id, newName.trim());
    }
    setIsRenaming(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${node.name}?`)) {
      deleteNode(node.id);
    }
  };

  const getFileIcon = () => {
    if (node.type === 'folder') {
      return isExpanded ? <FolderOpen size={18} /> : <FolderIcon size={18} />;
    }
    if (node.fileType?.includes('pdf')) {
      return <FileText size={18} />;
    }
    return <File size={18} />;
  };

  return (
    <div 
      className={`file-node ${isDragging ? 'dragging' : ''}`}
      style={{ paddingLeft: `${level * 20}px` }}
    >
      <div
        ref={(el) => {
          setDragRef(el);
          setDropRef(el);
        }}
        {...attributes}
        {...listeners}
        className={`file-node-content ${
          selectedFile?.id === node.id || (node.type === 'folder' && selectedFolder?.id === node.id) 
            ? 'selected' 
            : ''
        } ${isOver ? 'drop-target' : ''}`}
        onClick={handleClick}
      >
        {node.type === 'folder' && (
          <span className="chevron">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}
        <span className="file-icon">{getFileIcon()}</span>
        
        {isRenaming ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') setIsRenaming(false);
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            className="rename-input"
          />
        ) : (
          <span className="file-name">{node.name}</span>
        )}
        
        <div className="file-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsRenaming(true);
            }}
            className="action-btn"
            title="Rename"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="action-btn delete"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {node.type === 'folder' && isExpanded && node.children && (
        <div className="folder-children">
          {node.children.map(child => (
            <FileNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer = () => {
  const { fileTree, addFolder, moveNode } = useFileSystem();
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeNode = active.data.current?.node;
    const overNode = over.data.current?.node;

    if (overNode && overNode.type === 'folder' && activeNode.id !== overNode.id) {
      moveNode(activeNode.id, overNode.id);
    }
  };

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      addFolder('root', newFolderName.trim());
      setNewFolderName('');
      setShowNewFolder(false);
    }
  };

  return (
    <div className="file-explorer-container">
      <div className="file-explorer">
        <div className="explorer-header">
          <h3>PDF References</h3>
          <div className="header-actions">
            <button
              onClick={() => setShowNewFolder(true)}
              className="icon-btn"
              title="New Folder"
            >
              <FolderPlus size={18} />
            </button>
          </div>
        </div>

        {showNewFolder && (
          <div className="new-folder-input">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onBlur={() => {
                if (!newFolderName.trim()) setShowNewFolder(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddFolder();
                if (e.key === 'Escape') setShowNewFolder(false);
              }}
              placeholder="Folder name..."
              autoFocus
            />
          </div>
        )}

        <div className="file-tree">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <FileNode node={fileTree} />
          </DndContext>
        </div>
      </div>

      <DocumentExplorer />
    </div>
  );
};

export default FileExplorer;
