// Minimal debug controller to validate JWT tokens
exports.whoami = async (req, res) => {
try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    return res.json({ id: req.user._id, email: req.user.email });
} catch (err) {
    console.error('Error in whoami:', err);
    return res.status(500).json({ error: 'Server error' });
}
};
