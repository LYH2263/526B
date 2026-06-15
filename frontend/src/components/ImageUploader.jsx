import React, { useState, useRef, useCallback } from 'react';
import request from '../api/request';

const ImageUploader = ({ value, onChange, maxSizeMB = 10, quality = 0.8 }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [retryFile, setRetryFile] = useState(null);
    const fileInputRef = useRef(null);

    const compressImage = (file, targetQuality = quality) => {
        return new Promise((resolve, reject) => {
            if (file.size <= maxSizeMB * 1024 * 1024 && file.type === 'image/jpeg') {
                resolve(file);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const maxDim = 2000;

                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = (height / width) * maxDim;
                            width = maxDim;
                        } else {
                            width = (width / height) * maxDim;
                            height = maxDim;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const compressedFile = new File([blob], file.name, {
                                    type: 'image/jpeg',
                                    lastModified: Date.now(),
                                });
                                resolve(compressedFile);
                            } else {
                                resolve(file);
                            }
                        },
                        'image/jpeg',
                        targetQuality
                    );
                };
                img.onerror = () => reject(new Error('图片读取失败'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsDataURL(file);
        });
    };

    const validateFile = (file) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('仅支持 JPG、PNG、WebP 格式的图片');
            return false;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`文件大小不能超过 ${maxSizeMB}MB`);
            return false;
        }
        setError('');
        return true;
    };

    const handleFile = useCallback(async (file) => {
        if (!file) return;

        if (!validateFile(file)) {
            return;
        }

        const localPreviewUrl = URL.createObjectURL(file);
        setPreviewUrl(localPreviewUrl);
        setRetryFile(null);

        try {
            const compressedFile = await compressImage(file);
            await uploadFile(compressedFile);
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        } catch (err) {
            setRetryFile(file);
            setError(err.message || '上传失败，请重试');
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, [previewUrl]);

    const uploadFile = async (file) => {
        setIsUploading(true);
        setUploadProgress(0);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await request.post('/images/upload/cover', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(progress);
                    }
                },
            });

            setIsUploading(false);
            setUploadProgress(100);
            setPreviewUrl(null);

            if (onChange) {
                onChange(result);
            }
        } catch (err) {
            throw err;
        }
    };

    const handleRetry = () => {
        if (retryFile) {
            handleFile(retryFile);
        }
    };

    const handleRemove = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setError('');
        setRetryFile(null);
        setUploadProgress(0);
        setIsUploading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (onChange) {
            onChange(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleClick = () => {
        if (fileInputRef.current && !isUploading) {
            fileInputRef.current.click();
        }
    };

    const handleInputChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const displayUrl = previewUrl || value?.thumbDetailUrl || value?.originalUrl;

    return (
        <div className="w-full">
            <div
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : error
                        ? 'border-red-400 bg-red-50'
                        : displayUrl
                        ? 'border-gray-200 bg-gray-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleInputChange}
                    disabled={isUploading}
                />

                {displayUrl ? (
                    <div className="relative">
                        <img
                            src={displayUrl}
                            alt="封面预览"
                            className="max-h-48 mx-auto rounded-lg object-contain shadow-md"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                                <div className="text-white text-center">
                                    <div className="text-lg font-semibold mb-2">上传中...</div>
                                    <div className="w-32 h-2 bg-white/30 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-white transition-all duration-200"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                    <div className="text-sm mt-1">{uploadProgress}%</div>
                                </div>
                            </div>
                        )}
                        {!isUploading && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove();
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="py-8">
                        {isUploading ? (
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                                <div className="text-gray-600 font-medium mb-2">正在上传...</div>
                                <div className="w-full max-w-xs mx-auto h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-200"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <div className="text-sm text-gray-500 mt-2">{uploadProgress}%</div>
                            </div>
                        ) : (
                            <>
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="text-gray-700 font-medium mb-1">
                                    点击或拖拽图片到此处上传
                                </div>
                                <div className="text-sm text-gray-400">
                                    支持 JPG、PNG、WebP 格式，最大 {maxSizeMB}MB
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                    {retryFile && (
                        <button
                            type="button"
                            onClick={handleRetry}
                            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                        >
                            重新上传
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
