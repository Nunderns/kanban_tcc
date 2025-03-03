const DottedSeparator = ({ className }: { className?: string }) => {
    return <hr className={`border-t border-dotted border-gray-300 ${className}`} />;
};

export default DottedSeparator;
