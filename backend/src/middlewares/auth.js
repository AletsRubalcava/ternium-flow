import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Verify JWT token
export function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Permissions map per role and module
export const permissions = {
  administrador: {
    'commercial': ['create', 'read', 'update', 'delete', 'manage', 'approve'],
    'consignatarios': ['create', 'read', 'update', 'delete', 'manage'],
    'clientes': ['create', 'read', 'update', 'delete', 'manage'],
    'followUps': ['create', 'read', 'update', 'delete', 'manage'],
    'tarimas': ['create', 'read', 'update', 'delete', 'manage'],
    'requests': ['create', 'read', 'update', 'delete', 'manage'],
    'productos': ['create', 'read', 'update', 'delete', 'manage'],
    'usuarios': ['create', 'read', 'update', 'delete', 'manage'],
    'home': ['access'],
    'shared': ['access'],
    'config': ['read', 'manage']
  },
  gestion_clientes: {
    'consignatarios': ['create', 'read', 'update', 'delete', 'manage'],
    'commercial': ['create', 'read', 'update', 'delete', 'manage', 'approve'],
    'clientes': ['create', 'read', 'update', 'delete', 'manage'],
    'productos': ['read'],
    'config': ['read'],
    'tarimas': ['create', 'read', 'update', 'delete', 'manage'],
    'requests': ['create', 'read', 'update', 'delete', 'manage'],
    'followUps': ['create', 'read', 'update', 'delete', 'manage'],
    'home': ['access'],
    'shared': ['access']
  },
  operador_logistico: {
    'commercial': ['read'],
    'clientes': ['read'],
    'consignatarios': ['read'],
    'productos': ['create', 'read', 'update', 'delete', 'manage'],
    'followUps': ['create', 'read', 'update', 'delete', 'manage'],
    'tarimas': ['create', 'read', 'update', 'delete', 'manage'],
    'requests': ['read'],
    'home': ['access'],
    'shared': ['access']
  },
  customer: {
    'home': ['access'],
    'clientes': ['read'],
    'consignatarios': ['create', 'read', 'update', 'delete', 'manage'],
    'config': ['read'],
    'tarimas': ['create', 'read', 'update', 'delete', 'manage'],
    'requests': ['create', 'read', 'delete', 'update'],
    'productos': ['read'],
    'followUps': ['create', 'read', 'manage'],
    'shared': ['access']
  }
};

// Authorize middleware: checks if user role has permission for module/action
export function authorize(moduleName, action) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    
    const role = req.user.role;
    const rolePerms = permissions[role];
    
    if (!rolePerms) return res.status(403).json({ message: 'Role not recognized' });
    if (!rolePerms[moduleName]) return res.status(403).json({ message: `Access denied to ${moduleName}` });
    
    const allowed = rolePerms[moduleName];
    
    // Check direct action permission
    if (allowed.includes(action)) return next();
    
    // Check if action matches (e.g., POST maps to create, GET to read, PUT to update, DELETE to delete)
    if (action === 'create' && allowed.includes('create')) return next();
    if (action === 'read' && allowed.includes('read')) return next();
    if (action === 'update' && allowed.includes('update')) return next();
    if (action === 'delete' && allowed.includes('delete')) return next();
    
    return res.status(403).json({ message: `Access denied: ${action} not allowed on ${moduleName}` });
  };
}

// Check if user owns the resource (for Cliente update_own, read_own)
export function checkOwnership(idField = 'id') {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    
    const resourceId = req.params[idField] || req.params.id;
    const userId = req.user.id_cliente || req.user.id;
    
    // For Cliente role, can only access own resource
    if (req.user.role === 'customer') {
      if (resourceId !== userId && resourceId !== req.user.id_cliente) {
        return res.status(403).json({ message: 'Can only access own resources' });
      }
    }
    next();
  };
}
